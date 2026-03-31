import type { APIRoute } from "astro";
import { error, json, isLanguage } from "../../lib/validators";
import type { CfEnv } from "../../lib/usage";
import {
  getSessionData,
  saveSessionData,
  isUiLocale
} from "../../lib/session-utils";

export const prerender = false;

export const GET: APIRoute = async (context) => {
  const env = context.locals as CfEnv;
  const sessionId = context.cookies.get("__session")?.value;

  if (!sessionId) {
    return json({ uiLocale: "ja" }, 200);
  }

  const data = await getSessionData(env, sessionId);
  return json({ uiLocale: data.uiLocale ?? "ja" }, 200);
};

export const PUT: APIRoute = async (context) => {
  const env = context.locals as CfEnv;
  const sessionId = context.cookies.get("__session")?.value;

  if (!sessionId) {
    return error("No session", 400);
  }

  let body: unknown;
  try {
    body = await context.request.json();
  } catch {
    return error("Invalid JSON", 400);
  }

  const uiLocale = (body as Record<string, unknown>)?.uiLocale;
  if (!isUiLocale(uiLocale)) {
    return error("Invalid uiLocale", 400);
  }

  const data = await getSessionData(env, sessionId);
  await saveSessionData(env, sessionId, { ...data, uiLocale });

  return json({ ok: true }, 200);
};

export const ALL: APIRoute = () => {
  return error("Method not allowed", 405);
};
