import type { APIRoute } from "astro";
import { isLanguage, isMode, isTone, error, json } from "../../lib/validators";
import type { TranslateRequest } from "../../lib/types";
import { translateText } from "../../lib/translate";
import {
  checkUsageLimit,
  incrementUsage,
  notifyUsage,
  saveUsage,
  type CfEnv
} from "../../lib/usage";

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

  // Get Cloudflare env from context.locals
  const env = context.locals as CfEnv;

  // Check usage limits before making API call
  const usageState = await checkUsageLimit(env);

  // Handle limit exceeded
  if (usageState.blocked) {
    if (usageState.shouldAlert100) {
      await notifyUsage(
        env,
        `[VinaNihon] Daily limit reached: ${usageState.usage.count} requests`
      );
      usageState.usage.alert100Sent = true;
      await saveUsage(env, usageState.key, usageState.usage);
    }

    return json(
      {
        error: "limit_exceeded",
        message: "本日の翻訳上限に達しました。明日リセットされます。",
        reset: "daily"
      },
      429
    );
  }

  // Handle 80% alert
  if (usageState.shouldAlert80) {
    await notifyUsage(
      env,
      `[VinaNihon] 80% usage reached: ${usageState.usage.count}/${usageState.usage.count + 1} requests`
    );
    usageState.usage.alert80Sent = true;
    await saveUsage(env, usageState.key, usageState.usage);
  }

  try {
    const result = await translateText(input);
    // Increment usage after successful translation
    await incrementUsage(
      env,
      usageState.key,
      usageState.usage,
      input.text,
      result.mainTranslation
    );
    return json(result, 200);
  } catch (cause) {
    console.error("/api/translate failed", cause);
    return error("翻訳処理に失敗しました。しばらく経ってから再度お試しください。", 500);
  }
};

export const ALL: APIRoute = () => {
  return error("Method not allowed.", 405);
};
