// Re-export types
export type {
  TranslationProviderName,
  RuntimeEnv
} from "./config";

export { TranslationProviderError } from "./config";

// Re-export providers
export { createProvider, toProviderError } from "./providers";

// Main API
import type {
  ReplyRequest,
  ReplyResponse,
  TranslateRequest,
  TranslateResponse,
  TranslationDetailsRequest,
  TranslationDetailsResponse
} from "../types";
import type { RuntimeEnv } from "./config";
import { toProviderError } from "./config";
import { createProvider } from "./providers";

export async function translateText(
  input: TranslateRequest,
  runtimeEnv?: RuntimeEnv
): Promise<TranslateResponse> {
  const provider = createProvider(runtimeEnv);

  try {
    return await provider.translate(input);
  } catch (cause) {
    throw toProviderError(cause);
  }
}

export async function translateDetails(
  input: TranslationDetailsRequest,
  runtimeEnv?: RuntimeEnv
): Promise<TranslationDetailsResponse> {
  const provider = createProvider(runtimeEnv);

  try {
    return await provider.translateDetails(input);
  } catch (cause) {
    throw toProviderError(cause);
  }
}

export async function suggestReplies(
  input: ReplyRequest,
  runtimeEnv?: RuntimeEnv
): Promise<ReplyResponse> {
  const provider = createProvider(runtimeEnv);

  try {
    return await provider.suggestReplies(input);
  } catch (cause) {
    throw toProviderError(cause);
  }
}
