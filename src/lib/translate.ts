import { buildReplyPrompt, buildTranslatePrompt } from "./prompt";
import type {
  Mode,
  ReplyRequest,
  ReplyResponse,
  Tone,
  TranslateRequest,
  TranslateResponse
} from "./types";

export type TranslationProviderName = "mock" | "openai";
export type RuntimeEnv = Record<string, string | undefined> | undefined;

interface TranslationProvider {
  translate(input: TranslateRequest): Promise<TranslateResponse>;
  suggestReplies(input: ReplyRequest): Promise<ReplyResponse>;
}

function readEnv(name: string, runtimeEnv?: RuntimeEnv): string | undefined {
  const runtimeValue = runtimeEnv?.[name];
  if (typeof runtimeValue === "string" && runtimeValue.length > 0) {
    return runtimeValue;
  }

  const staticValue = (import.meta.env as Record<string, unknown>)[name];
  if (typeof staticValue === "string" && staticValue.length > 0) {
    return staticValue;
  }

  return undefined;
}

function getProviderName(runtimeEnv?: RuntimeEnv): TranslationProviderName {
  const raw = readEnv("TRANSLATION_PROVIDER", runtimeEnv)?.toLowerCase() ?? "mock";
  return raw === "openai" ? "openai" : "mock";
}

function modeLabel(mode: Mode): string {
  switch (mode) {
    case "daily":
      return "日常";
    case "work":
      return "仕事";
    case "customer-service":
      return "接客";
    case "hospital":
      return "病院";
  }
}

function toneLabel(tone: Tone): string {
  switch (tone) {
    case "casual":
      return "カジュアル";
    case "normal":
      return "標準";
    case "polite":
      return "丁寧";
  }
}

function directionLabel(sourceLang: string, targetLang: string): string {
  return `${sourceLang.toUpperCase()}→${targetLang.toUpperCase()}`;
}

const mockProvider: TranslationProvider = {
  async translate(input) {
    const cleanedText = input.text.trim();
    const direction = directionLabel(input.sourceLang, input.targetLang);

    return {
      mainTranslation: `[${direction} / ${modeLabel(input.mode)} / ${toneLabel(input.tone)}] ${cleanedText}`,
      alternatives: [
        `別案1: ${cleanedText}`,
        `別案2: ${cleanedText}`
      ],
      nuanceNotes: [
        `${modeLabel(input.mode)}の場面で伝わりやすい表現を優先。`,
        `${toneLabel(input.tone)}に合わせた語調に調整。`
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
        `返信例2: ありがとうございます。内容を確認して連絡します。`,
        `返信例3: 承知しました。よろしくお願いします。`
      ]
    };
  }
};

function createOpenAIPlaceholderProvider(apiKey?: string): TranslationProvider {
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is required when TRANSLATION_PROVIDER=openai");
  }

  return {
    async translate(input) {
      const prompt = buildTranslatePrompt(input);
      throw new Error(`openai provider is not implemented yet. Prompt prepared: ${prompt}`);
    },
    async suggestReplies(input) {
      const prompt = buildReplyPrompt(input);
      throw new Error(`openai provider is not implemented yet. Prompt prepared: ${prompt}`);
    }
  };
}

function createProvider(runtimeEnv?: RuntimeEnv): TranslationProvider {
  const providerName = getProviderName(runtimeEnv);

  if (providerName === "openai") {
    return createOpenAIPlaceholderProvider(readEnv("OPENAI_API_KEY", runtimeEnv));
  }

  return mockProvider;
}

export async function translateText(
  input: TranslateRequest,
  runtimeEnv?: RuntimeEnv
): Promise<TranslateResponse> {
  const provider = createProvider(runtimeEnv);
  return provider.translate(input);
}

export async function suggestReplies(
  input: ReplyRequest,
  runtimeEnv?: RuntimeEnv
): Promise<ReplyResponse> {
  const provider = createProvider(runtimeEnv);
  return provider.suggestReplies(input);
}
