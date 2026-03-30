import { env as cloudflareEnv } from "cloudflare:workers";

export type TranslationProviderName = "mock" | "openai";
export type RuntimeEnv = Record<string, string | undefined> | undefined;

class TranslationProviderError extends Error {
  cause?: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = "TranslationProviderError";
    this.cause = cause;
  }
}

function readServerEnv(name: string, runtimeEnv?: RuntimeEnv): string | undefined {
  const runtimeValue = runtimeEnv?.[name];
  if (typeof runtimeValue === "string" && runtimeValue.length > 0) {
    return runtimeValue;
  }

  const astroValue = (import.meta.env as Record<string, unknown>)[name];
  if (typeof astroValue === "string" && astroValue.length > 0) {
    return astroValue;
  }

  const cloudflareValue = (cloudflareEnv as Record<string, unknown>)[name];
  if (typeof cloudflareValue === "string" && cloudflareValue.length > 0) {
    return cloudflareValue;
  }

  return undefined;
}

function getProviderName(runtimeEnv?: RuntimeEnv): TranslationProviderName {
  const raw = readServerEnv("TRANSLATION_PROVIDER", runtimeEnv)?.toLowerCase() ?? "mock";
  if (raw === "openai") {
    return "openai";
  }

  return "mock";
}

function getOpenAIModel(runtimeEnv?: RuntimeEnv): string {
  return readServerEnv("OPENAI_MODEL", runtimeEnv) ?? "gpt-4.1-mini";
}

function getOpenAIBaseUrl(runtimeEnv?: RuntimeEnv): string {
  return (readServerEnv("OPENAI_BASE_URL", runtimeEnv) ?? "https://api.openai.com/v1").replace(
    /\/+$/,
    ""
  );
}

function getOpenAIApiKey(runtimeEnv?: RuntimeEnv): string {
  const apiKey = readServerEnv("OPENAI_API_KEY", runtimeEnv);
  if (!apiKey) {
    throw new TranslationProviderError(
      "OPENAI_API_KEY is required when TRANSLATION_PROVIDER=openai."
    );
  }

  return apiKey;
}

function buildApiUrl(baseUrl: string, defaultPath: "responses" | "chat/completions"): string {
  if (baseUrl.endsWith("/responses") || baseUrl.endsWith("/chat/completions")) {
    return baseUrl;
  }

  return `${baseUrl}/${defaultPath}`;
}

function usesChatCompletionsForOpenAIProvider(baseUrl: string): boolean {
  const lowerBaseUrl = baseUrl.toLowerCase();
  return lowerBaseUrl.includes("minimax") || lowerBaseUrl.endsWith("/chat/completions");
}

function toProviderError(cause: unknown): TranslationProviderError {
  if (cause instanceof TranslationProviderError) {
    return cause;
  }

  if (cause instanceof Error) {
    return new TranslationProviderError(cause.message, cause);
  }

  return new TranslationProviderError("Unexpected provider failure.", cause);
}

export {
  TranslationProviderError,
  readServerEnv,
  getProviderName,
  getOpenAIModel,
  getOpenAIBaseUrl,
  getOpenAIApiKey,
  buildApiUrl,
  usesChatCompletionsForOpenAIProvider,
  toProviderError
};
