import type { APIRoute } from "astro";
import { LANGUAGES, MODES, TONES, type Language, type Mode, type Tone, type TranslateRequest } from "../../lib/types";
import { translateText } from "../../lib/translate";

export const prerender = false;

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8"
    }
  });
}

function error(message: string, status: number): Response {
  return json({ error: { message } }, status);
}

function isLanguage(value: unknown): value is Language {
  return typeof value === "string" && LANGUAGES.includes(value as Language);
}

function isMode(value: unknown): value is Mode {
  return typeof value === "string" && MODES.includes(value as Mode);
}

function isTone(value: unknown): value is Tone {
  return typeof value === "string" && TONES.includes(value as Tone);
}

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

function getRuntimeEnv(context: Parameters<APIRoute>[0]): Record<string, string | undefined> | undefined {
  return ((context.locals as { runtime?: { env?: Record<string, string | undefined> } }).runtime?.env ??
    undefined) as Record<string, string | undefined> | undefined;
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
    const result = await translateText(input, getRuntimeEnv(context));
    return json(result, 200);
  } catch (cause) {
    console.error("/api/translate failed", cause);
    const message = cause instanceof Error ? cause.message : "Translation failed. Please try again.";
    return error(message, 500);
  }
};

export const ALL: APIRoute = () => {
  return error("Method not allowed.", 405);
};
