// Cloudflare Pages / Workers environment types
export interface CfEnv {
  SESSION?: {
    get: (key: string) => Promise<string | null>;
    put: (key: string, value: string, options?: { expirationTtl?: number }) => Promise<void>;
  };
  ALERT_WEBHOOK_URL?: string;
  runtime?: Record<string, unknown>;
}

export type UsageRecord = {
  count: number;
  tokens: number;
  alert80Sent: boolean;
  alert100Sent: boolean;
};

export const DAILY_REQUEST_LIMIT = 300;
export const ALERT_THRESHOLD = 0.8;

function getUsageKey(date = new Date()): string {
  return `usage:${date.toISOString().slice(0, 10)}`;
}

export async function loadUsage(env: CfEnv, key: string): Promise<UsageRecord> {
  const raw = await env.SESSION?.get(key);
  if (!raw) {
    return { count: 0, tokens: 0, alert80Sent: false, alert100Sent: false };
  }

  try {
    return JSON.parse(raw) as UsageRecord;
  } catch {
    return { count: 0, tokens: 0, alert80Sent: false, alert100Sent: false };
  }
}

export async function saveUsage(env: CfEnv, key: string, usage: UsageRecord): Promise<void> {
  await env.SESSION?.put(key, JSON.stringify(usage), {
    expirationTtl: 60 * 60 * 24 * 3
  });
}

export function estimateTokens(input: string, output: string): number {
  return Math.ceil((input.length + output.length) / 2);
}

export async function checkUsageLimit(
  env: CfEnv
): Promise<{
  key: string;
  usage: UsageRecord;
  blocked: boolean;
  shouldAlert80: boolean;
  shouldAlert100: boolean;
}> {
  const key = getUsageKey();
  const usage = await loadUsage(env, key);

  const blocked = usage.count >= DAILY_REQUEST_LIMIT;
  const shouldAlert80 =
    !usage.alert80Sent && usage.count >= Math.floor(DAILY_REQUEST_LIMIT * ALERT_THRESHOLD);
  const shouldAlert100 =
    !usage.alert100Sent && usage.count >= DAILY_REQUEST_LIMIT;

  return {
    key,
    usage,
    blocked,
    shouldAlert80,
    shouldAlert100
  };
}

export async function incrementUsage(
  env: CfEnv,
  key: string,
  usage: UsageRecord,
  input: string,
  output: string
): Promise<void> {
  usage.count += 1;
  usage.tokens += estimateTokens(input, output);
  await saveUsage(env, key, usage);
}

export async function notifyUsage(
  env: CfEnv,
  message: string
): Promise<void> {
  if (!env.ALERT_WEBHOOK_URL) {
    console.log(message);
    return;
  }

  try {
    await fetch(env.ALERT_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: message })
    });
  } catch (e) {
    console.error("Failed to send webhook notification:", e);
  }
}
