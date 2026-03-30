import type { APIRoute } from "astro";
import { isLanguage, isMode, isTone, error, json } from "../../lib/validators";
import type { ReplyRequest } from "../../lib/types";
import { suggestReplies } from "../../lib/translate";

export const prerender = false;

function parseRequestBody(body: unknown): ReplyRequest | null {
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
  let body: unknown;

  try {
    body = await context.request.json();
  } catch {
    return error("Invalid JSON body.", 400);
  }

  const input = parseRequestBody(body);
  if (!input) {
    return error("Invalid request payload for /api/reply.", 400);
  }

  try {
    const result = await suggestReplies(input);
    return json(result, 200);
  } catch (cause) {
    console.error("/api/reply failed", cause);
    return error("返信例の生成に失敗しました。しばらく経ってから再度お試しください。", 500);
  }
};

export const ALL: APIRoute = () => {
  return error("Method not allowed.", 405);
};
