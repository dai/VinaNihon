import type { Language, Mode, Tone } from "./types";

export type UiLocale = Language;
export type ThemeMode = "light" | "dark";

export interface UiCopy {
  pageTitle: string;
  pageDescription: string;
  appSubtitle: string;
  sourceLangLabel: string;
  targetLangLabel: string;
  swapAriaLabel: string;
  textLabel: string;
  textPlaceholder: string;
  modeLabel: string;
  toneLabel: string;
  submitIdle: string;
  submitLoading: string;
  formStatusLoading: string;
  loadDetailsIdle: string;
  loadDetailsLoading: string;
  detailsStatusLoading: string;
  detailsStatusReady: string;
  voiceStatusStopped: string;
  voiceStatusReading: string;
  voiceStatusReadDone: string;
  voiceStatusListening: string;
  voiceStatusCaptured: string;
  voiceStatusUnsupportedAll: string;
  voiceStatusUnsupportedSpeak: string;
  voiceStatusUnsupportedListen: string;
  errorInputRequired: string;
  errorSpeechUnsupported: string;
  errorListenUnsupported: string;
  errorSpeakEmpty: string;
  errorSpeakFailed: string;
  errorCopyEmpty: string;
  errorCopyFailed: string;
  errorTranslateFailed: string;
  errorDetailsFailed: string;
  errorHistoryLoadFailed: string;
  errorHistorySaveFailed: string;
  errorMicUnavailable: string;
  errorMicNotAllowed: string;
  errorNoSpeech: string;
  errorLanguageNotSupported: string;
  errorListenFailed: string;
  resultsHeading: string;
  mainTranslationHeading: string;
  alternativesHeading: string;
  nuanceHeading: string;
  repliesHeading: string;
  historyHeading: string;
  historyEmpty: string;
  historyReuse: string;
  historyDelete: string;
  historyClearAll: string;
  historyConfirmClearAll: string;
  historySourceLabel: string;
  historyTargetLabel: string;
  historyCreatedAtLabel: string;
  emptyList: string;
  copyLabel: string;
  copiedLabel: string;
  speakLabel: string;
  stopLabel: string;
  listenLabel: string;
  themeToggleToDark: string;
  themeToggleToLight: string;
  themeToggleToDarkAria: string;
  themeToggleToLightAria: string;
  footerAuthorLabel: string;
  footerXLabel: string;
  languageOptions: Record<Language, string>;
  modeOptions: Record<Mode, string>;
  toneOptions: Record<Tone, string>;
}

export const DEFAULT_UI_LOCALE: UiLocale = "ja";
export const DEFAULT_THEME: ThemeMode = "light";

export const STORAGE_KEYS = {
  sourceLang: "vinanihon-source-lang",
  theme: "vinanihon-theme",
  history: "vinanihon-history"
} as const;

export const THEME_COLORS: Record<ThemeMode, string> = {
  light: "#f8f7fc",
  dark: "#0e141f"
};

export const UI_COPY: Record<UiLocale, UiCopy> = {
  ja: {
    pageTitle: "VinaNihon",
    pageDescription: "ベトナム語↔日本語を自然に翻訳するシンプルなツール",
    appSubtitle: "ベトナム語↔日本語の自然翻訳",
    sourceLangLabel: "入力言語",
    targetLangLabel: "翻訳先言語",
    swapAriaLabel: "入力言語と翻訳先言語を入れ替える",
    textLabel: "翻訳したい文",
    textPlaceholder: "ここに文章を入力してください",
    modeLabel: "モード",
    toneLabel: "トーン",
    submitIdle: "翻訳する",
    submitLoading: "翻訳中...",
    formStatusLoading: "翻訳しています。しばらくお待ちください。",
    loadDetailsIdle: "補足を表示",
    loadDetailsLoading: "補足を読み込み中...",
    detailsStatusLoading: "補足情報を読み込んでいます。",
    detailsStatusReady: "補足情報を表示しました。",
    voiceStatusStopped: "音声入力を停止しました。",
    voiceStatusReading: "読み上げ中です。",
    voiceStatusReadDone: "読み上げが完了しました。",
    voiceStatusListening: "音声入力を開始しました。話してください。",
    voiceStatusCaptured: "音声をテキストに反映しました。",
    voiceStatusUnsupportedAll: "このブラウザでは音声機能を利用できません。",
    voiceStatusUnsupportedSpeak: "このブラウザでは読み上げを利用できません。",
    voiceStatusUnsupportedListen: "このブラウザでは音声入力を利用できません。",
    errorInputRequired: "翻訳したい文を入力してください。",
    errorSpeechUnsupported: "このブラウザでは読み上げを利用できません。",
    errorListenUnsupported: "このブラウザでは音声入力を利用できません。",
    errorSpeakEmpty: "読み上げる内容がありません。",
    errorSpeakFailed: "読み上げに失敗しました。",
    errorCopyEmpty: "コピーする内容がありません。",
    errorCopyFailed: "コピーに失敗しました。",
    errorTranslateFailed: "翻訳処理に失敗しました。",
    errorDetailsFailed: "補足情報の取得に失敗しました。",
    errorHistoryLoadFailed: "履歴の読み込みに失敗しました。",
    errorHistorySaveFailed: "履歴の保存に失敗しました。",
    errorMicUnavailable: "マイクが利用できません。",
    errorMicNotAllowed: "マイクの利用が許可されていません。",
    errorNoSpeech: "音声を検出できませんでした。",
    errorLanguageNotSupported: "この言語では音声入力を利用できません。",
    errorListenFailed: "音声入力に失敗しました。",
    resultsHeading: "翻訳結果",
    mainTranslationHeading: "主翻訳",
    alternativesHeading: "言い換え候補",
    nuanceHeading: "ニュアンスメモ",
    repliesHeading: "返信例",
    historyHeading: "履歴",
    historyEmpty: "履歴はまだありません。",
    historyReuse: "再入力",
    historyDelete: "削除",
    historyClearAll: "全件削除",
    historyConfirmClearAll: "履歴をすべて削除しますか？",
    historySourceLabel: "原文",
    historyTargetLabel: "主翻訳",
    historyCreatedAtLabel: "日時",
    emptyList: "なし",
    copyLabel: "コピー",
    copiedLabel: "コピー済み",
    speakLabel: "読み上げ",
    stopLabel: "停止",
    listenLabel: "音声入力",
    themeToggleToDark: "ダークモード",
    themeToggleToLight: "ライトモード",
    themeToggleToDarkAria: "ダークモードに切り替える",
    themeToggleToLightAria: "ライトモードに切り替える",
    footerAuthorLabel: "作成者 GitHub:",
    footerXLabel: "X:",
    languageOptions: {
      ja: "日本語 🇯🇵",
      vi: "ベトナム語 🇻🇳"
    },
    modeOptions: {
      daily: "日常会話",
      work: "仕事",
      "customer-service": "接客",
      hospital: "病院"
    },
    toneOptions: {
      casual: "カジュアル",
      normal: "標準",
      polite: "丁寧"
    }
  },
  vi: {
    pageTitle: "VinaNihon",
    pageDescription: "Cong cu dich don gian giua tieng Viet va tieng Nhat",
    appSubtitle: "Dich tu nhien giua tieng Viet va tieng Nhat",
    sourceLangLabel: "Ngon ngu nhap",
    targetLangLabel: "Ngon ngu dich",
    swapAriaLabel: "Hoan doi ngon ngu nhap va ngon ngu dich",
    textLabel: "Noi dung can dich",
    textPlaceholder: "Nhap van ban tai day",
    modeLabel: "Che do",
    toneLabel: "Sac thai",
    submitIdle: "Dich",
    submitLoading: "Dang dich...",
    formStatusLoading: "Dang xu ly ban dich. Vui long doi.",
    loadDetailsIdle: "Xem bo sung",
    loadDetailsLoading: "Dang tai bo sung...",
    detailsStatusLoading: "Dang tai thong tin bo sung.",
    detailsStatusReady: "Da hien thong tin bo sung.",
    voiceStatusStopped: "Da dung nhap giong noi.",
    voiceStatusReading: "Dang doc noi dung.",
    voiceStatusReadDone: "Da doc xong.",
    voiceStatusListening: "Da bat nhap giong noi. Hay bat dau noi.",
    voiceStatusCaptured: "Da chen noi dung giong noi vao o nhap.",
    voiceStatusUnsupportedAll: "Trinh duyet nay khong ho tro tinh nang giong noi.",
    voiceStatusUnsupportedSpeak: "Trinh duyet nay khong ho tro doc van ban.",
    voiceStatusUnsupportedListen: "Trinh duyet nay khong ho tro nhap giong noi.",
    errorInputRequired: "Hay nhap noi dung can dich.",
    errorSpeechUnsupported: "Trinh duyet nay khong ho tro doc van ban.",
    errorListenUnsupported: "Trinh duyet nay khong ho tro nhap giong noi.",
    errorSpeakEmpty: "Khong co noi dung de doc.",
    errorSpeakFailed: "Khong the doc noi dung.",
    errorCopyEmpty: "Khong co noi dung de sao chep.",
    errorCopyFailed: "Sao chep that bai.",
    errorTranslateFailed: "Xu ly ban dich that bai.",
    errorDetailsFailed: "Tai thong tin bo sung that bai.",
    errorHistoryLoadFailed: "Tai lich su that bai.",
    errorHistorySaveFailed: "Luu lich su that bai.",
    errorMicUnavailable: "Khong the su dung micro.",
    errorMicNotAllowed: "Micro chua duoc cap quyen.",
    errorNoSpeech: "Khong nhan duoc giong noi.",
    errorLanguageNotSupported: "Ngon ngu nay khong ho tro nhap giong noi.",
    errorListenFailed: "Nhap giong noi that bai.",
    resultsHeading: "Ket qua dich",
    mainTranslationHeading: "Ban dich chinh",
    alternativesHeading: "Cach dien dat khac",
    nuanceHeading: "Ghi chu sac thai",
    repliesHeading: "Goi y phan hoi",
    historyHeading: "Lich su",
    historyEmpty: "Chua co lich su.",
    historyReuse: "Dung lai",
    historyDelete: "Xoa",
    historyClearAll: "Xoa tat ca",
    historyConfirmClearAll: "Ban co muon xoa toan bo lich su khong?",
    historySourceLabel: "Van ban goc",
    historyTargetLabel: "Ban dich chinh",
    historyCreatedAtLabel: "Thoi gian",
    emptyList: "Khong co",
    copyLabel: "Sao chep",
    copiedLabel: "Da sao chep",
    speakLabel: "Doc",
    stopLabel: "Dung",
    listenLabel: "Nhap giong noi",
    themeToggleToDark: "Che do toi",
    themeToggleToLight: "Che do sang",
    themeToggleToDarkAria: "Chuyen sang che do toi",
    themeToggleToLightAria: "Chuyen sang che do sang",
    footerAuthorLabel: "Tac gia GitHub:",
    footerXLabel: "X:",
    languageOptions: {
      ja: "Tieng Nhat 🇯🇵",
      vi: "Tieng Viet 🇻🇳"
    },
    modeOptions: {
      daily: "Hang ngay",
      work: "Cong viec",
      "customer-service": "Cham soc khach hang",
      hospital: "Benh vien"
    },
    toneOptions: {
      casual: "Than mat",
      normal: "Tieu chuan",
      polite: "Lich su"
    }
  }
};
