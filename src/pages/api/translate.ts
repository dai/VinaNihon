import type { APIRoute } from "astro";
import { isLanguage, isMode, isTone, error, json } from "../../lib/validators";
import type { TranslateRequest } from "../../lib/types";
import { translateText } from "../../lib/translate";

export const prerender = false;

function parseRequestBody(body: unknown): TranslateRequest | null {
  if (!body || typeof body !== "object") {
    return null;
  }

  const sourceLang = (body as Record<string, unknown>).sourceLang;
  const targetLang = (body as Record<string, unknown>).targetLang;
  const text = (body as Record<string, unknown>).text;
  const mode = (body as Record<string, unknown>).mode;
  const tone = (body as Record<string, unknown>).tone;

  if (!isLanguage(sourceLang) || !isLanguage(targetLang)) {
    return null;
  }

  if (!isMode(mode) || !isTone(tone)) {
    return null;
  }

  if (typeof text !== "string" || text.trim().length === 0) {
    return null;
  }

  return {
    sourceLang,
    targetLang,
    text: text.trim(),
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
    return error("Invalid request payload for /api/translate.", 400);
  }

  try {
    const result = await translateText(input);
    return json(result, 200);
  } catch (cause) {
    console.error("/api/translate failed", cause);
    return error("翻訳処理に失敗しました。しばらく経ってから再度お試しください。", 500);
  }
};

export const ALL: APIRoute = () => {
  return error("Method not allowed.", 405);
};
