export const LANGUAGES = ["ja", "vi"] as const;
export type Language = (typeof LANGUAGES)[number];

export const MODES = ["daily", "work", "customer-service", "hospital"] as const;
export type Mode = (typeof MODES)[number];

export const TONES = ["casual", "normal", "polite"] as const;
export type Tone = (typeof TONES)[number];

export interface TranslateRequest {
  sourceLang: Language;
  targetLang: Language;
  text: string;
  mode: Mode;
  tone: Tone;
}

export interface TranslateContext {
  sourceLang: Language;
  targetLang: Language;
  mode: Mode;
  tone: Tone;
}

export interface TranslateResponse {
  mainTranslation: string;
  context: TranslateContext;
}

export interface TranslationDetailsRequest {
  sourceLang: Language;
  targetLang: Language;
  originalText: string;
  mainTranslation: string;
  mode: Mode;
  tone: Tone;
}

export interface TranslationDetailsResponse {
  alternatives: string[];
  nuanceNotes: string[];
  suggestedReplies: string[];
}

export interface ReplyRequest {
  sourceLang: Language;
  targetLang: Language;
  originalText: string;
  mainTranslation: string;
  mode: Mode;
  tone: Tone;
}

export interface ReplyResponse {
  suggestedReplies: string[];
}

export interface ApiError {
  error: {
    message: string;
  };
}
