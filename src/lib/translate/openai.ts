import {
  TranslationProviderError,
  buildApiUrl,
  getOpenAIApiKey,
  getOpenAIModel,
  getOpenAIBaseUrl,
  usesChatCompletionsForOpenAIProvider
} from "./config";

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

export type { CompatibleApiConfig, ChatCompletionsApiConfig };
export {
  callCompatibleApiJson,
  callChatCompletionsJson,
  parseJsonObject,
  stripStructuredNoise,
  extractOpenAIOutputText,
  extractChatCompletionsText,
  extractOpenAIErrorMessage
};
