import type { Language, Mode, Tone } from "../lib/types";
import type { UiCopy, UiLocale, ThemeMode } from "../lib/ui-copy";

export interface TranslatorConfig {
  defaultLocale: UiLocale;
  defaultTheme: ThemeMode;
  emptyListValues: string[];
  storageKeys: {
    sourceLang: string;
    theme: string;
    history: string;
  };
  themeColors: Record<ThemeMode, string>;
  uiCopy: Record<UiLocale, UiCopy>;
}

declare global {
  interface Window {
    __TRANSLATOR_CONFIG__?: TranslatorConfig;
  }
}

export function getConfig(): TranslatorConfig {
  const config = window.__TRANSLATOR_CONFIG__;
  if (!config) {
    throw new Error("Translator config not initialized");
  }
  return config;
}

export type { Language, Mode, Tone, UiCopy, UiLocale, ThemeMode };
