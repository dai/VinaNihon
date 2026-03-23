import type { ReplyRequest, TranslateRequest, TranslationDetailsRequest } from "./types";

export function buildTranslatePrompt(input: TranslateRequest): string {
  return [
    `Translate from ${input.sourceLang} to ${input.targetLang}.`,
    `Mode: ${input.mode}.`,
    `Tone: ${input.tone}.`,
    "Return only the best, concise, natural translation.",
    `Text: ${input.text}`
  ].join("\n");
}

export function buildTranslationDetailsPrompt(input: TranslationDetailsRequest): string {
  return [
    `Source language: ${input.sourceLang}.`,
    `Target language: ${input.targetLang}.`,
    `Mode: ${input.mode}.`,
    `Tone: ${input.tone}.`,
    `Original text: ${input.originalText}`,
    `Main translation: ${input.mainTranslation}`,
    "Based on the translation above, provide only short alternatives, nuance notes, and brief reply suggestions."
  ].join("\n");
}

export function buildReplyPrompt(input: ReplyRequest): string {
  return [
    `Generate replies in ${input.targetLang}.`,
    `Mode: ${input.mode}.`,
    `Tone: ${input.tone}.`,
    `Original text: ${input.originalText}`,
    `Main translation: ${input.mainTranslation}`
  ].join("\n");
}
