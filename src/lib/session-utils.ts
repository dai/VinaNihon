import { isLanguage } from "./validators";
import type { CfEnv } from "./usage";
import type { Language } from "./types";

export interface SessionData {
  uiLocale?: Language;
}

export async function getSessionData(
  env: CfEnv,
  sessionId: string
): Promise<SessionData> {
  const raw = await env.SESSION?.get(`session:${sessionId}`);
  if (!raw) {
    return {};
  }
  try {
    return JSON.parse(raw) as SessionData;
  } catch {
    return {};
  }
}

export async function saveSessionData(
  env: CfEnv,
  sessionId: string,
  data: SessionData
): Promise<void> {
  await env.SESSION?.put(`session:${sessionId}`, JSON.stringify(data), {
    expirationTtl: 60 * 60 * 24 * 30
  });
}

export function isUiLocale(value: unknown): value is Language {
  return isLanguage(value);
}
