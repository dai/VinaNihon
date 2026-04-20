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
  historyCopy: string;
  historySpeak: string;
  historyDelete: string;
  historyPin: string;
  historyUnpin: string;
  historyPinnedHeading: string;
  historyPinnedBadge: string;
  historyClearAll: string;
  historyActionsHeading: string;
  historyConfirmClearAll: string;
  historyExpandDetails: string;
  historyCollapseDetails: string;
  historySourceLabel: string;
  historyTargetLabel: string;
  historyCreatedAtLabel: string;
  emptyList: string;
  copyLabel: string;
  copiedLabel: string;
  speakLabel: string;
  stopLabel: string;
  listenLabel: string;
  tooltipSourceSpeak: string;
  tooltipSourceListen: string;
  tooltipMainSpeak: string;
  tooltipMainCopy: string;
  tooltipAlternativesSpeak: string;
  tooltipAlternativesCopy: string;
  tooltipNuanceSpeak: string;
  tooltipNuanceCopy: string;
  tooltipRepliesSpeak: string;
  tooltipRepliesCopy: string;
  tooltipLineShare: string;
  tooltipHistoryReuse: string;
  tooltipHistoryCopy: string;
  tooltipHistoryDelete: string;
  tooltipHistorySpeak: string;
  tooltipHistoryPin: string;
  tooltipHistoryUnpin: string;
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
    historyCopy: "コピー",
    historySpeak: "読み上げ",
    historyDelete: "削除",
    historyPin: "ピン留め",
    historyUnpin: "ピン留め解除",
    historyPinnedHeading: "ピン留め",
    historyPinnedBadge: "Pinned",
    historyClearAll: "全件削除",
    historyActionsHeading: "履歴操作",
    historyConfirmClearAll: "履歴をすべて削除しますか？",
    historyExpandDetails: "履歴の詳細を開く",
    historyCollapseDetails: "履歴の詳細を閉じる",
    historySourceLabel: "原文",
    historyTargetLabel: "主翻訳",
    historyCreatedAtLabel: "日時",
    emptyList: "なし",
    copyLabel: "コピー",
    copiedLabel: "コピー済み",
    speakLabel: "読み上げ",
    stopLabel: "停止",
    listenLabel: "音声入力",
    tooltipSourceSpeak: "入力文を読み上げる",
    tooltipSourceListen: "音声入力を開始する",
    tooltipMainSpeak: "主翻訳を読み上げる",
    tooltipMainCopy: "主翻訳をコピーする",
    tooltipAlternativesSpeak: "言い換え候補を読み上げる",
    tooltipAlternativesCopy: "言い換え候補をコピーする",
    tooltipNuanceSpeak: "ニュアンスメモを読み上げる",
    tooltipNuanceCopy: "ニュアンスメモをコピーする",
    tooltipRepliesSpeak: "返信例を読み上げる",
    tooltipRepliesCopy: "返信例をコピーする",
    tooltipLineShare: "LINEに送る",
    tooltipHistoryReuse: "この履歴を再入力する",
    tooltipHistoryCopy: "この履歴の主翻訳をコピーする",
    tooltipHistoryDelete: "この履歴を削除する",
    tooltipHistorySpeak: "この履歴の主翻訳を読み上げる",
    tooltipHistoryPin: "この履歴をピン留めする",
    tooltipHistoryUnpin: "この履歴のピン留めを解除する",
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
    pageDescription: "Công cụ dịch đơn giản giữa tiếng Việt và tiếng Nhật",
    appSubtitle: "Dịch tự nhiên giữa tiếng Việt và tiếng Nhật",
    sourceLangLabel: "Ngôn ngữ nhập",
    targetLangLabel: "Ngôn ngữ dịch",
    swapAriaLabel: "Hoán đổi ngôn ngữ nhập và ngôn ngữ dịch",
    textLabel: "Nội dung cần dịch",
    textPlaceholder: "Nhập văn bản tại đây",
    modeLabel: "Chế độ",
    toneLabel: "Sắc thái",
    submitIdle: "Dịch",
    submitLoading: "Đang dịch...",
    formStatusLoading: "Đang xử lý bản dịch. Vui lòng đợi.",
    loadDetailsIdle: "Xem bổ sung",
    loadDetailsLoading: "Đang tải bổ sung...",
    detailsStatusLoading: "Đang tải thông tin bổ sung.",
    detailsStatusReady: "Đã hiển thị thông tin bổ sung.",
    voiceStatusStopped: "Đã dừng nhập giọng nói.",
    voiceStatusReading: "Đang đọc nội dung.",
    voiceStatusReadDone: "Đã đọc xong.",
    voiceStatusListening: "Đã bắt nhập giọng nói. Hãy bắt đầu nói.",
    voiceStatusCaptured: "Đã chèn nội dung giọng nói vào ô nhập.",
    voiceStatusUnsupportedAll: "Trình duyệt này không hỗ trợ tính năng giọng nói.",
    voiceStatusUnsupportedSpeak: "Trình duyệt này không hỗ trợ đọc văn bản.",
    voiceStatusUnsupportedListen: "Trình duyệt này không hỗ trợ nhập giọng nói.",
    errorInputRequired: "Hãy nhập nội dung cần dịch.",
    errorSpeechUnsupported: "Trình duyệt này không hỗ trợ đọc văn bản.",
    errorListenUnsupported: "Trình duyệt này không hỗ trợ nhập giọng nói.",
    errorSpeakEmpty: "Không có nội dung để đọc.",
    errorSpeakFailed: "Không thể đọc nội dung.",
    errorCopyEmpty: "Không có nội dung để sao chép.",
    errorCopyFailed: "Sao chép thất bại.",
    errorTranslateFailed: "Xử lý bản dịch thất bại.",
    errorDetailsFailed: "Tải thông tin bổ sung thất bại.",
    errorHistoryLoadFailed: "Tải lịch sử thất bại.",
    errorHistorySaveFailed: "Lưu lịch sử thất bại.",
    errorMicUnavailable: "Không thể sử dụng micro.",
    errorMicNotAllowed: "Micro chưa được cấp quyền.",
    errorNoSpeech: "Không nhận được giọng nói.",
    errorLanguageNotSupported: "Ngôn ngữ này không hỗ trợ nhập giọng nói.",
    errorListenFailed: "Nhập giọng nói thất bại.",
    resultsHeading: "Kết quả dịch",
    mainTranslationHeading: "Bản dịch chính",
    alternativesHeading: "Cách diễn đạt khác",
    nuanceHeading: "Ghi chú sắc thái",
    repliesHeading: "Gợi ý phản hồi",
    historyHeading: "Lịch sử",
    historyEmpty: "Chưa có lịch sử.",
    historyReuse: "Dùng lại",
    historyCopy: "Sao chép",
    historySpeak: "Đọc",
    historyDelete: "Xóa",
    historyPin: "Ghim",
    historyUnpin: "Bỏ ghim",
    historyPinnedHeading: "Đã ghim",
    historyPinnedBadge: "Đã ghim",
    historyClearAll: "Xóa tất cả",
    historyActionsHeading: "Tác vụ lịch sử",
    historyConfirmClearAll: "Bạn có muốn xóa toàn bộ lịch sử không?",
    historyExpandDetails: "Mở chi tiết lịch sử",
    historyCollapseDetails: "Thu gọn chi tiết lịch sử",
    historySourceLabel: "Văn bản gốc",
    historyTargetLabel: "Bản dịch chính",
    historyCreatedAtLabel: "Thời gian",
    emptyList: "Không có",
    copyLabel: "Sao chép",
    copiedLabel: "Đã sao chép",
    speakLabel: "Đọc",
    stopLabel: "Dừng",
    listenLabel: "Nhập giọng nói",
    tooltipSourceSpeak: "Đọc văn bản đã nhập",
    tooltipSourceListen: "Bắt đầu nhập bằng giọng nói",
    tooltipMainSpeak: "Đọc bản dịch chính",
    tooltipMainCopy: "Sao chép bản dịch chính",
    tooltipAlternativesSpeak: "Đọc các cách diễn đạt khác",
    tooltipAlternativesCopy: "Sao chép các cách diễn đạt khác",
    tooltipNuanceSpeak: "Đọc ghi chú sắc thái",
    tooltipNuanceCopy: "Sao chép ghi chú sắc thái",
    tooltipRepliesSpeak: "Đọc gợi ý phản hồi",
    tooltipRepliesCopy: "Sao chép gợi ý phản hồi",
    tooltipLineShare: "Gửi qua LINE",
    tooltipHistoryReuse: "Điền lại mục lịch sử này",
    tooltipHistoryCopy: "Sao chép bản dịch chính của mục này",
    tooltipHistoryDelete: "Xóa mục lịch sử này",
    tooltipHistorySpeak: "Đọc bản dịch chính của mục này",
    tooltipHistoryPin: "Ghim mục lịch sử này",
    tooltipHistoryUnpin: "Bỏ ghim mục lịch sử này",
    themeToggleToDark: "Chế độ tối",
    themeToggleToLight: "Chế độ sáng",
    themeToggleToDarkAria: "Chuyển sang chế độ tối",
    themeToggleToLightAria: "Chuyển sang chế độ sáng",
    footerAuthorLabel: "Tác giả GitHub:",
    footerXLabel: "X:",
    languageOptions: {
      ja: "Tiếng Nhật 🇯🇵",
      vi: "Tiếng Việt 🇻🇳"
    },
    modeOptions: {
      daily: "Hàng ngày",
      work: "Công việc",
      "customer-service": "Chăm sóc khách hàng",
      hospital: "Bệnh viện"
    },
    toneOptions: {
      casual: "Thân mật",
      normal: "Tiêu chuẩn",
      polite: "Lịch sự"
    }
  }
};
