import type {
  TranslateRequest,
  TranslateResponse,
  TranslationDetailsResponse,
  ReplyResponse
} from "../types";
import { TranslationProviderError } from "./config";

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter((item) => item.length > 0);
}

function normalizeTranslateResponse(
  data: Record<string, unknown>,
  input: TranslateRequest
): TranslateResponse {
  const mainTranslation =
    typeof data.mainTranslation === "string" ? data.mainTranslation.trim() : "";

  if (!mainTranslation) {
    throw new TranslationProviderError("OpenAI response missing mainTranslation.");
  }

  return {
    mainTranslation,
    context: {
      sourceLang: input.sourceLang,
      targetLang: input.targetLang,
      mode: input.mode,
      tone: input.tone
    }
  };
}

function normalizeTranslationDetailsResponse(
  data: Record<string, unknown>
): TranslationDetailsResponse {
  return {
    alternatives: toStringArray(data.alternatives),
    nuanceNotes: toStringArray(data.nuanceNotes),
    suggestedReplies: toStringArray(data.suggestedReplies)
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

export { toStringArray, normalizeTranslateResponse, normalizeTranslationDetailsResponse, normalizeReplyResponse };
