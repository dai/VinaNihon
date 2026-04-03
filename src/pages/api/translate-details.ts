import type { APIRoute } from "astro";
import { isLanguage, isMode, isTone, error, json } from "../../lib/validators";
import { parseJsonBody } from "../../lib/api-utils";
import type { TranslationDetailsRequest } from "../../lib/types";
import { translateDetails } from "../../lib/translate";

export const prerender = false;

function parseRequestBody(body: unknown): TranslationDetailsRequest | null {
  if (!body || typeof body !== "object") {
    return null;
  }

  const sourceLang = (body as Record<string, unknown>).sourceLang;
  const targetLang = (body as Record<string, unknown>).targetLang;
  const originalText = (body as Record<string, unknown>).originalText;
  const mainTranslation = (body as Record<string, unknown>).mainTranslation;
  const mode = (body as Record<string, unknown>).mode;
  const tone = (body as Record<string, unknown>).tone;

  if (!isLanguage(sourceLang) || !isLanguage(targetLang)) {
    return null;
  }

  if (!isMode(mode) || !isTone(tone)) {
    return null;
  }

  if (typeof originalText !== "string" || originalText.trim().length === 0) {
    return null;
  }

  if (typeof mainTranslation !== "string" || mainTranslation.trim().length === 0) {
    return null;
  }

  return {
    sourceLang,
    targetLang,
    originalText: originalText.trim(),
    mainTranslation: mainTranslation.trim(),
    mode,
    tone
  };
}

export const POST: APIRoute = async (context) => {
  const result = await parseJsonBody(
    context,
    parseRequestBody,
    "Invalid request payload for /api/translate-details."
  );

  if (!result.success) {
    return result.errorResponse;
  }

  try {
    const translateResult = await translateDetails(result.data);
    return json(translateResult, 200);
  } catch (cause) {
    console.error("/api/translate-details failed", cause);
    return error("補足情報の取得に失敗しました。しばらく経ってから再度お試しください。", 500);
  }
};

export const ALL: APIRoute = () => {
  return error("Method not allowed.", 405);
};
