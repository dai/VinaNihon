import { env as cloudflareEnv } from "cloudflare:workers";
import {
  buildReplyPrompt,
  buildTranslateWithRepliesPrompt
} from "./prompt";
import type {
  ReplyRequest,
  ReplyResponse,
  TranslateRequest,
  TranslateWithRepliesResponse
} from "./types";

export type TranslationProviderName = "mock" | "openai";
export type RuntimeEnv = Record<string, string | undefined> | undefined;

interface TranslationProvider {
  translate(input: TranslateRequest): Promise<TranslateWithRepliesResponse>;
  suggestReplies(input: ReplyRequest): Promise<ReplyResponse>;
}

const DEFAULT_OPENAI_MODEL = "gpt-4.1-mini";
const DEFAULT_OPENAI_BASE_URL = "https://api.openai.com/v1";

interface CompatibleApiConfig {
  apiKey: string;
  apiUrl: string;
  model: string;
  providerLabel: string;
}

interface ChatCompletionsApiConfig {
  apiKey: string;
  apiUrl: string;
  model: string;
  providerLabel: string;
}

class TranslationProviderError extends Error {
  cause?: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = "TranslationProviderError";
    this.cause = cause;
  }
}

function readServerEnv(name: string, runtimeEnv?: RuntimeEnv): string | undefined {
  const runtimeValue = runtimeEnv?.[name];
  if (typeof runtimeValue === "string" && runtimeValue.length > 0) {
    return runtimeValue;
  }

  const astroValue = (import.meta.env as Record<string, unknown>)[name];
  if (typeof astroValue === "string" && astroValue.length > 0) {
    return astroValue;
  }

  const cloudflareValue = (cloudflareEnv as Record<string, unknown>)[name];
  if (typeof cloudflareValue === "string" && cloudflareValue.length > 0) {
    return cloudflareValue;
  }

  return undefined;
}

function getProviderName(runtimeEnv?: RuntimeEnv): TranslationProviderName {
  const raw = readServerEnv("TRANSLATION_PROVIDER", runtimeEnv)?.toLowerCase() ?? "mock";
  if (raw === "openai") {
    return "openai";
  }

  return "mock";
}

function getOpenAIModel(runtimeEnv?: RuntimeEnv): string {
  return readServerEnv("OPENAI_MODEL", runtimeEnv) ?? DEFAULT_OPENAI_MODEL;
}

function getOpenAIBaseUrl(runtimeEnv?: RuntimeEnv): string {
  return (readServerEnv("OPENAI_BASE_URL", runtimeEnv) ?? DEFAULT_OPENAI_BASE_URL).replace(
    /\/+$/,
    ""
  );
}

function getOpenAIApiKey(runtimeEnv?: RuntimeEnv): string {
  const apiKey = readServerEnv("OPENAI_API_KEY", runtimeEnv);
  if (!apiKey) {
    throw new TranslationProviderError(
      "OPENAI_API_KEY is required when TRANSLATION_PROVIDER=openai."
    );
  }

  return apiKey;
}

function buildApiUrl(baseUrl: string, defaultPath: "responses" | "chat/completions"): string {
  if (baseUrl.endsWith("/responses") || baseUrl.endsWith("/chat/completions")) {
    return baseUrl;
  }

  return `${baseUrl}/${defaultPath}`;
}

function usesChatCompletionsForOpenAIProvider(baseUrl: string): boolean {
  const lowerBaseUrl = baseUrl.toLowerCase();
  return lowerBaseUrl.includes("minimax") || lowerBaseUrl.endsWith("/chat/completions");
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter((item) => item.length > 0);
}

function parseJsonObject(text: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(text) as unknown;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");

    if (start >= 0 && end > start) {
      try {
        const parsed = JSON.parse(text.slice(start, end + 1)) as unknown;
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          return parsed as Record<string, unknown>;
        }
      } catch {
        // no-op, fall through to error
      }
    }
  }

  throw new TranslationProviderError("OpenAI response was not valid JSON.");
}

function stripStructuredNoise(text: string): string {
  return text
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function extractOpenAIOutputText(payload: unknown): string {
  if (!payload || typeof payload !== "object") {
    return "";
  }

  const directText = (payload as { output_text?: unknown }).output_text;
  if (typeof directText === "string" && directText.trim().length > 0) {
    return directText.trim();
  }

  const output = (payload as { output?: unknown }).output;
  if (!Array.isArray(output)) {
    return "";
  }

  const parts: string[] = [];

  for (const item of output) {
    if (!item || typeof item !== "object") {
      continue;
    }

    const content = (item as { content?: unknown }).content;
    if (!Array.isArray(content)) {
      continue;
    }

    for (const chunk of content) {
      if (!chunk || typeof chunk !== "object") {
        continue;
      }

      if ((chunk as { type?: unknown }).type !== "output_text") {
        continue;
      }

      const text = (chunk as { text?: unknown }).text;
      if (typeof text === "string" && text.trim().length > 0) {
        parts.push(text.trim());
      }
    }
  }

  return parts.join("\n").trim();
}

function extractChatCompletionsText(payload: unknown): string {
  if (!payload || typeof payload !== "object") {
    return "";
  }

  const choices = (payload as { choices?: unknown }).choices;
  if (!Array.isArray(choices) || choices.length === 0) {
    return "";
  }

  const firstChoice = choices[0];
  if (!firstChoice || typeof firstChoice !== "object") {
    return "";
  }

  const message = (firstChoice as { message?: unknown }).message;
  if (!message || typeof message !== "object") {
    return "";
  }

  const content = (message as { content?: unknown }).content;
  if (typeof content === "string") {
    return stripStructuredNoise(content);
  }

  return "";
}

function extractOpenAIErrorMessage(status: number, payload: unknown): string {
  if (payload && typeof payload === "object") {
    const error = (payload as { error?: unknown }).error;
    if (error && typeof error === "object") {
      const message = (error as { message?: unknown }).message;
      if (typeof message === "string" && message.trim().length > 0) {
        return message;
      }
    }
  }

  return `OpenAI API request failed with status ${status}.`;
}

async function callCompatibleApiJson(
  config: CompatibleApiConfig,
  instructions: string,
  input: string,
  schemaHint: string
): Promise<Record<string, unknown>> {
  let response: Response;

  try {
    const inputWithJsonHint = `Return output as valid json.\n${input}`;

    response = await fetch(config.apiUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        instructions,
        input: inputWithJsonHint,
        text: {
          format: {
            type: "json_object"
          }
        }
      })
    });
  } catch (cause) {
    throw new TranslationProviderError(`Failed to reach ${config.providerLabel} API.`, cause);
  }

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new TranslationProviderError(extractOpenAIErrorMessage(response.status, payload));
  }

  const outputText = extractOpenAIOutputText(payload);
  if (!outputText) {
    throw new TranslationProviderError(`${config.providerLabel} returned an empty response.`);
  }

  const parsed = parseJsonObject(outputText);

  if (!parsed || typeof parsed !== "object") {
    throw new TranslationProviderError(
      `${config.providerLabel} returned invalid ${schemaHint} JSON.`
    );
  }

  return parsed;
}

async function callChatCompletionsJson(
  config: ChatCompletionsApiConfig,
  instructions: string,
  input: string,
  schemaHint: string
): Promise<Record<string, unknown>> {
  let response: Response;

  try {
    response = await fetch(config.apiUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          {
            role: "system",
            content: `${instructions}\nAlways return valid JSON only.`
          },
          {
            role: "user",
            content: `Return output as valid json.\n${input}`
          }
        ],
        temperature: 0.2
      })
    });
  } catch (cause) {
    throw new TranslationProviderError(`Failed to reach ${config.providerLabel} API.`, cause);
  }

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new TranslationProviderError(extractOpenAIErrorMessage(response.status, payload));
  }

  const outputText = extractChatCompletionsText(payload);
  if (!outputText) {
    throw new TranslationProviderError(`${config.providerLabel} returned an empty response.`);
  }

  const parsed = parseJsonObject(outputText);
  if (!parsed || typeof parsed !== "object") {
    throw new TranslationProviderError(
      `${config.providerLabel} returned invalid ${schemaHint} JSON.`
    );
  }

  return parsed;
}

function normalizeTranslateResponse(
  data: Record<string, unknown>,
  input: TranslateRequest
): TranslateWithRepliesResponse {
  const mainTranslation =
    typeof data.mainTranslation === "string" ? data.mainTranslation.trim() : "";

  if (!mainTranslation) {
    throw new TranslationProviderError("OpenAI response missing mainTranslation.");
  }

  return {
    mainTranslation,
    alternatives: toStringArray(data.alternatives),
    nuanceNotes: toStringArray(data.nuanceNotes),
    suggestedReplies: toStringArray(data.suggestedReplies),
    context: {
      sourceLang: input.sourceLang,
      targetLang: input.targetLang,
      mode: input.mode,
      tone: input.tone
    }
  };
}

function normalizeReplyResponse(data: Record<string, unknown>): ReplyResponse {
  const suggestedReplies = toStringArray(data.suggestedReplies);

  if (suggestedReplies.length === 0) {
    throw new TranslationProviderError("OpenAI response missing suggestedReplies.");
  }

  return {
    suggestedReplies
  };
}

const TRANSLATE_INSTRUCTIONS = [
  "You are a professional translator focused on Japanese and Vietnamese.",
  "Always output valid JSON.",
  "Return exactly this shape:",
  '{"mainTranslation":"string","alternatives":["string"],"nuanceNotes":["string"],"suggestedReplies":["string"]}',
  "Rules:",
  "- mainTranslation must be the best natural translation in target language.",
  "- alternatives should be 2 to 4 useful variants in target language.",
  "- nuanceNotes should be 1 to 3 short notes explaining tone/context choices.",
  "- suggestedReplies should be 2 to 4 short practical reply examples in target language."
].join("\n");

const REPLY_INSTRUCTIONS = [
  "You generate suggested replies for Japanese-Vietnamese conversations.",
  "Always output valid JSON.",
  "Return exactly this shape:",
  '{"suggestedReplies":["string"]}',
  "Rules:",
  "- suggestedReplies should contain 2 to 4 natural reply examples.",
  "- Every reply must be in target language.",
  "- Keep replies short and practical for chat usage."
].join("\n");

const mockProvider: TranslationProvider = {
  async translate(input) {
    const cleanedText = input.text.trim();

    return {
      mainTranslation: `[MOCK ${input.sourceLang}->${input.targetLang}] ${cleanedText}`,
      alternatives: [`別案1: ${cleanedText}`, `別案2: ${cleanedText}`],
      nuanceNotes: [
        `${input.mode}モードを想定した表現です。`,
        `${input.tone}トーンを優先しています。`
      ],
      suggestedReplies: [
        `返信例1: ${cleanedText}`,
        "返信例2: ありがとうございます。内容を確認します。",
        "返信例3: 承知しました。よろしくお願いします。"
      ],
      context: {
        sourceLang: input.sourceLang,
        targetLang: input.targetLang,
        mode: input.mode,
        tone: input.tone
      }
    };
  },

  async suggestReplies(input) {
    return {
      suggestedReplies: [
        `返信例1: ${input.mainTranslation}`,
        "返信例2: ありがとうございます。内容を確認します。",
        "返信例3: 承知しました。よろしくお願いします。"
      ]
    };
  }
};

function createOpenAIProvider(runtimeEnv?: RuntimeEnv): TranslationProvider {
  const apiKey = getOpenAIApiKey(runtimeEnv);
  const model = getOpenAIModel(runtimeEnv);
  const baseUrl = getOpenAIBaseUrl(runtimeEnv);

  if (usesChatCompletionsForOpenAIProvider(baseUrl)) {
    const config: ChatCompletionsApiConfig = {
      apiKey,
      apiUrl: buildApiUrl(baseUrl, "chat/completions"),
      model,
      providerLabel: "OpenAI-compatible"
    };

    return {
      async translate(input) {
        const prompt = buildTranslateWithRepliesPrompt(input);
        const data = await callChatCompletionsJson(
          config,
          TRANSLATE_INSTRUCTIONS,
          prompt,
          "translate"
        );
        return normalizeTranslateResponse(data, input);
      },

      async suggestReplies(input) {
        const prompt = buildReplyPrompt(input);
        const data = await callChatCompletionsJson(config, REPLY_INSTRUCTIONS, prompt, "reply");
        return normalizeReplyResponse(data);
      }
    };
  }

  const config: CompatibleApiConfig = {
    apiKey,
    apiUrl: buildApiUrl(baseUrl, "responses"),
    model,
    providerLabel: "OpenAI"
  };

  return {
    async translate(input) {
      const prompt = buildTranslateWithRepliesPrompt(input);
      const data = await callCompatibleApiJson(config, TRANSLATE_INSTRUCTIONS, prompt, "translate");
      return normalizeTranslateResponse(data, input);
    },

    async suggestReplies(input) {
      const prompt = buildReplyPrompt(input);
      const data = await callCompatibleApiJson(config, REPLY_INSTRUCTIONS, prompt, "reply");
      return normalizeReplyResponse(data);
    }
  };
}

function createProvider(runtimeEnv?: RuntimeEnv): TranslationProvider {
  const providerName = getProviderName(runtimeEnv);
  if (providerName === "openai") {
    return createOpenAIProvider(runtimeEnv);
  }

  return mockProvider;
}

function toProviderError(cause: unknown): TranslationProviderError {
  if (cause instanceof TranslationProviderError) {
    return cause;
  }

  if (cause instanceof Error) {
    return new TranslationProviderError(cause.message, cause);
  }

  return new TranslationProviderError("Unexpected provider failure.", cause);
}

export async function translateText(
  input: TranslateRequest,
  runtimeEnv?: RuntimeEnv
): Promise<TranslateWithRepliesResponse> {
  const provider = createProvider(runtimeEnv);

  try {
    return await provider.translate(input);
  } catch (cause) {
    throw toProviderError(cause);
  }
}

export async function suggestReplies(
  input: ReplyRequest,
  runtimeEnv?: RuntimeEnv
): Promise<ReplyResponse> {
  const provider = createProvider(runtimeEnv);

  try {
    return await provider.suggestReplies(input);
  } catch (cause) {
    throw toProviderError(cause);
  }
}
