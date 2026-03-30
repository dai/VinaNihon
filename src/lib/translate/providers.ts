import type {
  ReplyRequest,
  ReplyResponse,
  TranslateRequest,
  TranslateResponse,
  TranslationDetailsRequest,
  TranslationDetailsResponse
} from "../types";
import type { RuntimeEnv } from "./config";
import {
  TranslationProviderError,
  getProviderName,
  getOpenAIApiKey,
  getOpenAIModel,
  getOpenAIBaseUrl,
  buildApiUrl,
  usesChatCompletionsForOpenAIProvider,
  toProviderError
} from "./config";
import {
  callCompatibleApiJson,
  callChatCompletionsJson
} from "./openai";
import {
  normalizeTranslateResponse,
  normalizeTranslationDetailsResponse,
  normalizeReplyResponse
} from "./normalize";
import {
  buildReplyPrompt,
  buildTranslatePrompt,
  buildTranslationDetailsPrompt
} from "../prompt";

interface TranslationProvider {
  translate(input: TranslateRequest): Promise<TranslateResponse>;
  translateDetails(input: TranslationDetailsRequest): Promise<TranslationDetailsResponse>;
  suggestReplies(input: ReplyRequest): Promise<ReplyResponse>;
}

const TRANSLATE_INSTRUCTIONS = [
  "You are a professional translator focused on Japanese and Vietnamese.",
  "Always output valid JSON.",
  'Return exactly this shape:',
  '{"mainTranslation":"string"}',
  "Rules:",
  "- mainTranslation must be the best natural translation in target language.",
  "- Keep it concise and avoid extra explanation."
].join("\n");

const TRANSLATION_DETAILS_INSTRUCTIONS = [
  "You provide short follow-up translation details for Japanese and Vietnamese.",
  "Always output valid JSON.",
  'Return exactly this shape:',
  '{"alternatives":["string"],"nuanceNotes":["string"],"suggestedReplies":["string"]}',
  "Rules:",
  "- alternatives should be 1 to 2 short useful variants in target language.",
  "- nuanceNotes should be 1 to 2 short notes only.",
  "- suggestedReplies should be 1 to 2 short practical reply examples in target language.",
  "- Keep every item concise."
].join("\n");

const REPLY_INSTRUCTIONS = [
  "You generate suggested replies for Japanese-Vietnamese conversations.",
  "Always output valid JSON.",
  'Return exactly this shape:',
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
      context: {
        sourceLang: input.sourceLang,
        targetLang: input.targetLang,
        mode: input.mode,
        tone: input.tone
      }
    };
  },

  async translateDetails(input) {
    return {
      alternatives: [`別案: ${input.mainTranslation}`],
      nuanceNotes: [`${input.mode}モード向けに簡潔化しています。`],
      suggestedReplies: ["承知しました。ありがとうございます。"]
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
    const config = {
      apiKey,
      apiUrl: buildApiUrl(baseUrl, "chat/completions"),
      model,
      providerLabel: "OpenAI-compatible"
    };

    return {
      async translate(input) {
        const prompt = buildTranslatePrompt(input);
        const data = await callChatCompletionsJson(
          config,
          TRANSLATE_INSTRUCTIONS,
          prompt,
          "translate"
        );
        return normalizeTranslateResponse(data, input);
      },

      async translateDetails(input) {
        const prompt = buildTranslationDetailsPrompt(input);
        const data = await callChatCompletionsJson(
          config,
          TRANSLATION_DETAILS_INSTRUCTIONS,
          prompt,
          "translation details"
        );
        return normalizeTranslationDetailsResponse(data);
      },

      async suggestReplies(input) {
        const prompt = buildReplyPrompt(input);
        const data = await callChatCompletionsJson(config, REPLY_INSTRUCTIONS, prompt, "reply");
        return normalizeReplyResponse(data);
      }
    };
  }

  const config = {
    apiKey,
    apiUrl: buildApiUrl(baseUrl, "responses"),
    model,
    providerLabel: "OpenAI"
  };

  return {
    async translate(input) {
      const prompt = buildTranslatePrompt(input);
      const data = await callCompatibleApiJson(config, TRANSLATE_INSTRUCTIONS, prompt, "translate");
      return normalizeTranslateResponse(data, input);
    },

    async translateDetails(input) {
      const prompt = buildTranslationDetailsPrompt(input);
      const data = await callCompatibleApiJson(
        config,
        TRANSLATION_DETAILS_INSTRUCTIONS,
        prompt,
        "translation details"
      );
      return normalizeTranslationDetailsResponse(data);
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

export { TranslationProvider, mockProvider, createProvider, toProviderError };
