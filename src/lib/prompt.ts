import type { ReplyRequest, TranslateRequest } from "./types";

export function buildTranslatePrompt(input: TranslateRequest): string {
  return [
    `Translate from ${input.sourceLang} to ${input.targetLang}.`,
    `Mode: ${input.mode}.`,
    `Tone: ${input.tone}.`,
    `Text: ${input.text}`
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
