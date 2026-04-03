import { getConfig } from "./translator-config";

declare global {
  interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList[];
  }
  interface SpeechRecognitionErrorEvent extends Event {
    error: string;
  }
}

const config = getConfig();

const {
  defaultLocale,
  defaultTheme,
  emptyListValues,
  storageKeys,
  themeColors,
  uiCopy
} = config;


const form = document.getElementById("translator-form") as HTMLFormElement | null;
const sourceLang = document.getElementById("sourceLang") as HTMLSelectElement | null;
const targetLang = document.getElementById("targetLang") as HTMLSelectElement | null;
const swapButton = document.getElementById("swapLanguages") as HTMLButtonElement | null;
const sourceText = document.getElementById("sourceText") as HTMLTextAreaElement | null;
const mode = document.getElementById("mode") as HTMLSelectElement | null;
const tone = document.getElementById("tone") as HTMLSelectElement | null;
const submitButton = document.getElementById("translateSubmit") as HTMLButtonElement | null;
const formStatus = document.getElementById("formStatus") as HTMLElement | null;
const voiceStatus = document.getElementById("voiceStatus") as HTMLElement | null;
const formError = document.getElementById("formError") as HTMLElement | null;
const themeToggle = document.getElementById("themeToggle") as HTMLButtonElement | null;
const localeToggle = document.getElementById("localeToggle") as HTMLElement | null;
const pageDescription = document.getElementById("page-description") as HTMLMetaElement | null;
const themeColorMeta = document.getElementById("theme-color-meta") as HTMLMetaElement | null;

const resultCard = document.getElementById("translationResult") as HTMLElement | null;
const mainTranslation = document.getElementById("mainTranslation") as HTMLElement | null;
const detailsContainer = document.getElementById("translationDetails") as HTMLElement | null;
const loadDetailsButton = document.getElementById("loadDetailsButton") as HTMLButtonElement | null;
const detailsStatus = document.getElementById("detailsStatus") as HTMLElement | null;
const alternativesList = document.getElementById("alternativesList") as HTMLUListElement | null;
const nuanceNotesList = document.getElementById("nuanceNotesList") as HTMLUListElement | null;
const suggestedRepliesList = document.getElementById("suggestedRepliesList") as HTMLUListElement | null;
const historySection = document.getElementById("translationHistory") as HTMLElement | null;
const historyListElement = document.getElementById("historyList") as HTMLElement | null;
const historyEmptyState = document.getElementById("historyEmptyState") as HTMLElement | null;
const clearHistoryButton = document.getElementById("clearHistoryButton") as HTMLButtonElement | null;
const copyTimers = new WeakMap<HTMLButtonElement, ReturnType<typeof setTimeout>>();
const i18nNodes = Array.from(document.querySelectorAll("[data-i18n]"));
const placeholderNodes = Array.from(document.querySelectorAll("[data-i18n-placeholder]"));
const ariaNodes = Array.from(document.querySelectorAll("[data-i18n-aria-label]"));
const optionNodes = Array.from(document.querySelectorAll("[data-option-group][data-option-value]"));
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
const speechSynthesisApi = window.speechSynthesis;
const speechLanguageMap: Record<string, string> = {
  ja: "ja-JP",
  vi: "vi-VN"
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let activeRecognition: any = null;
let activeListenButton: HTMLButtonElement | null = null;
let activeSpeakButton: HTMLButtonElement | null = null;
let speechVoices: SpeechSynthesisVoice[] = [];
let currentLocale = defaultLocale;
let currentTheme = defaultTheme;
let detailsLoaded = false;
let detailsLoading = false;
let lastTranslationRequest: {
  sourceLang: string;
  targetLang: string;
  text: string;
  mode: string;
  tone: string;
} | null = null;
let lastMainTranslation = "";
let historyList: Array<{
  id: string;
  sourceLang: string;
  targetLang: string;
  text: string;
  mode: string;
  tone: string;
  mainTranslation: string;
  createdAt: string;
}> = [];

function getUi(locale = currentLocale) {
  return uiCopy[locale] || uiCopy[defaultLocale];
}

function getSpeakButtons(): HTMLButtonElement[] {
  return Array.from(document.querySelectorAll('[data-voice-action="speak"]')) as HTMLButtonElement[];
}

function getListenButtons(): HTMLButtonElement[] {
  return Array.from(document.querySelectorAll('[data-voice-action="listen"]')) as HTMLButtonElement[];
}

function getCopyButtons(): HTMLButtonElement[] {
  return Array.from(document.querySelectorAll(".copy-button")) as HTMLButtonElement[];
}

function getUiText(key: string, fallback = "") {
  const ui = getUi() as unknown as Record<string, string>;
  return key && key in ui ? ui[key] : fallback;
}

function setButtonTooltip(button: HTMLButtonElement, message: string) {
  button.setAttribute("aria-label", message);
  button.title = message;
}

function isTheme(value: string): value is "light" | "dark" {
  return value === "light" || value === "dark";
}

function isLocale(value: string): value is "ja" | "vi" {
  return value === "ja" || value === "vi";
}

function isMode(value: string): value is "daily" | "work" | "customer-service" | "hospital" {
  return (
    value === "daily" ||
    value === "work" ||
    value === "customer-service" ||
    value === "hospital"
  );
}

function isTone(value: string): value is "casual" | "normal" | "polite" {
  return value === "casual" || value === "normal" || value === "polite";
}

function getStoredValue(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function setStoredValue(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    return;
  }
}

function setVoiceStatus(message: string) {
  if (voiceStatus) voiceStatus.textContent = message;
}

function setDetailsStatus(message: string) {
  if (detailsStatus) detailsStatus.textContent = message;
}

function clearList(listElement: HTMLUListElement | null) {
  if (listElement) listElement.innerHTML = "";
}

function updateDetailsControls() {
  if (!loadDetailsButton) {
    return;
  }

  const ui = getUi();
  loadDetailsButton.hidden = detailsLoaded;
  loadDetailsButton.disabled = detailsLoading;
  loadDetailsButton.textContent = detailsLoading ? ui.loadDetailsLoading : ui.loadDetailsIdle;

  if (detailsLoading) {
    setDetailsStatus(ui.detailsStatusLoading);
    return;
  }

  if (detailsLoaded) {
    setDetailsStatus(ui.detailsStatusReady);
    return;
  }

  setDetailsStatus("");
}

function resetDetailsState() {
  detailsLoaded = false;
  detailsLoading = false;
  clearList(alternativesList);
  clearList(nuanceNotesList);
  clearList(suggestedRepliesList);
  if (detailsContainer) detailsContainer.classList.add("is-hidden");
  updateDetailsControls();
}

function updateThemeToggle() {
  if (!themeToggle) {
    return;
  }

  const ui = getUi();
  const nextLabel = currentTheme === "dark" ? ui.themeToggleToLight : ui.themeToggleToDark;
  const nextAria =
    currentTheme === "dark" ? ui.themeToggleToLightAria : ui.themeToggleToDarkAria;

  themeToggle.textContent = nextLabel;
  themeToggle.setAttribute("aria-label", nextAria);
}

function updateLocaleToggle() {
  if (!localeToggle) {
    return;
  }
  const jaBtn = localeToggle.querySelector('[data-locale="ja"]') as HTMLButtonElement | null;
  const viBtn = localeToggle.querySelector('[data-locale="vi"]') as HTMLButtonElement | null;
  if (jaBtn) {
    jaBtn.setAttribute("aria-pressed", currentLocale === "ja" ? "true" : "false");
  }
  if (viBtn) {
    viBtn.setAttribute("aria-pressed", currentLocale === "vi" ? "true" : "false");
  }
}

function applyTheme(theme: string, persist = true) {
  currentTheme = isTheme(theme) ? theme : defaultTheme;
  document.documentElement.dataset.theme = currentTheme;

  if (themeColorMeta) {
    themeColorMeta.content = themeColors[currentTheme] || themeColors[defaultTheme];
  }

  updateThemeToggle();

  if (persist) {
    setStoredValue(storageKeys.theme, currentTheme);
  }
}

function updateButtonLabels() {
  const ui = getUi();

  for (const button of getSpeakButtons()) {
    button.dataset.defaultLabel = ui.speakLabel;
    setVoiceButtonState(button, button.classList.contains("is-active"));
  }

  for (const button of getListenButtons()) {
    button.dataset.defaultLabel = ui.listenLabel;
    setVoiceButtonState(button, button.classList.contains("is-active"));
  }

  for (const button of getCopyButtons()) {
    button.dataset.defaultLabel = ui.copyLabel;
    setCopyButtonState(button, button.classList.contains("is-copied"));
  }
}

function applyLocale(locale: string, persist = true) {
  currentLocale = isLocale(locale) ? locale : defaultLocale;
  const ui = getUi();

  document.documentElement.lang = currentLocale;
  document.title = ui.pageTitle;

  if (pageDescription) {
    pageDescription.content = ui.pageDescription;
  }

  for (const node of i18nNodes) {
    if (!(node instanceof HTMLElement)) {
      continue;
    }

    const key = node.dataset.i18n;
    if (!key || !(key in ui)) {
      continue;
    }

    node.textContent = (ui as unknown as Record<string, string>)[key];
  }

  for (const node of placeholderNodes) {
    if (!(node instanceof HTMLInputElement || node instanceof HTMLTextAreaElement)) {
      continue;
    }

    const key = node.dataset.i18nPlaceholder;
    if (!key || !(key in ui)) {
      continue;
    }

    node.placeholder = (ui as unknown as Record<string, string>)[key];
  }

  for (const node of ariaNodes) {
    if (!(node instanceof HTMLElement)) {
      continue;
    }

    const key = node.dataset.i18nAriaLabel;
    if (!key || !(key in ui)) {
      continue;
    }

    node.setAttribute("aria-label", (ui as unknown as Record<string, string>)[key]);
  }

  for (const node of optionNodes) {
    if (!(node instanceof HTMLOptionElement)) {
      continue;
    }

    const group = node.dataset.optionGroup;
    const value = node.dataset.optionValue;
    if (!group || !value) {
      continue;
    }

    if (group === "language" && ui.languageOptions[value as "ja" | "vi"]) {
      node.textContent = ui.languageOptions[value as "ja" | "vi"];
    }

    if (group === "mode" && ui.modeOptions[value as "daily" | "work" | "customer-service" | "hospital"]) {
      node.textContent = ui.modeOptions[value as "daily" | "work" | "customer-service" | "hospital"];
    }

    if (group === "tone" && ui.toneOptions[value as "casual" | "normal" | "polite"]) {
      node.textContent = ui.toneOptions[value as "casual" | "normal" | "polite"];
    }
  }

  if (submitButton && !submitButton.disabled) {
    submitButton.textContent = ui.submitIdle;
  }

  updateDetailsControls();
  updateThemeToggle();
  updateLocaleToggle();
  renderHistory(historyList);
  updateButtonLabels();

  if (persist) {
    fetch("/api/session-locale", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uiLocale: currentLocale })
    }).catch(() => {});
  }
}

function setLoading(isLoading: boolean) {
  const ui = getUi();

  if (submitButton) submitButton.disabled = isLoading;
  if (submitButton) submitButton.textContent = isLoading ? ui.submitLoading : ui.submitIdle;
  if (formStatus) formStatus.textContent = isLoading ? ui.formStatusLoading : "";
}

function setError(message: string) {
  if (!message) {
    if (formError) {
      formError.hidden = true;
      formError.textContent = "";
    }
    return;
  }

  if (formError) {
    formError.hidden = false;
    formError.textContent = message;
  }
}

function isHistoryEntry(value: unknown): value is {
  id: string;
  sourceLang: string;
  targetLang: string;
  text: string;
  mode: string;
  tone: string;
  mainTranslation: string;
  createdAt: string;
} {
  if (!value || typeof value !== "object") {
    return false;
  }

  const entry = value as Record<string, unknown>;
  return (
    typeof entry.id === "string" &&
    isLocale(entry.sourceLang as string) &&
    isLocale(entry.targetLang as string) &&
    typeof entry.text === "string" &&
    isMode(entry.mode as string) &&
    isTone(entry.tone as string) &&
    typeof entry.mainTranslation === "string" &&
    typeof entry.createdAt === "string"
  );
}

function generateHistoryId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }

  return `history-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function formatHistoryTimestamp(createdAt: string) {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) {
    return createdAt;
  }

  const locale = currentLocale === "vi" ? "vi-VN" : "ja-JP";
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

function createHistoryEntry(
  payload: { sourceLang: string; targetLang: string; text: string; mode: string; tone: string },
  translateData: { mainTranslation?: string }
) {
  return {
    id: generateHistoryId(),
    sourceLang: payload.sourceLang,
    targetLang: payload.targetLang,
    text: payload.text,
    mode: payload.mode,
    tone: payload.tone,
    mainTranslation: translateData.mainTranslation || "",
    createdAt: new Date().toISOString()
  };
}

function saveHistory(entries: typeof historyList) {
  try {
    localStorage.setItem(storageKeys.history, JSON.stringify(entries));
    return true;
  } catch {
    return false;
  }
}

function loadHistory() {
  try {
    const raw = getStoredValue(storageKeys.history);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isHistoryEntry).slice(0, 20);
  } catch {
    setError(getUi().errorHistoryLoadFailed);
    return [];
  }
}

function createHistoryRow(label: string, value: string) {
  const row = document.createElement("div");
  row.className = "history-row";

  const term = document.createElement("dt");
  term.className = "field-label";
  term.textContent = label;

  const description = document.createElement("dd");
  description.className = "result-body whitespace-pre-wrap";
  description.textContent = value;

  row.append(term, description);
  return row;
}

function getHistoryEntry(id: string) {
  return historyList.find((entry) => entry.id === id) || null;
}

function truncatePreview(text: string, length = 72) {
  const normalized = String(text || "").replace(/\s+/g, " ").trim();
  if (!normalized) {
    return "";
  }
  return normalized.length > length ? `${normalized.slice(0, length).trimEnd()}…` : normalized;
}

function setHistoryDisclosureState(detailsElement: HTMLDetailsElement) {
  const summary = detailsElement.querySelector(".history-item-summary") as HTMLElement | null;
  if (!summary) {
    return;
  }

  const label = detailsElement.open
    ? getUi().historyCollapseDetails
    : getUi().historyExpandDetails;

  summary.setAttribute("aria-label", label);
  summary.title = label;
}

function renderHistory(entries: typeof historyList) {
  if (!historyListElement || !historyEmptyState) {
    return;
  }

  historyListElement.innerHTML = "";
  historyEmptyState.classList.toggle("is-hidden", entries.length > 0);

  if (clearHistoryButton) {
    clearHistoryButton.disabled = entries.length === 0;
  }

  const ui = getUi();

  for (const [index, entry] of entries.entries()) {
    const detailsElement = document.createElement("details");
    detailsElement.className = "history-item";
    detailsElement.dataset.historyId = entry.id;
    detailsElement.dataset.historyParity = index % 2 === 0 ? "even" : "odd";

    const summary = document.createElement("summary");
    summary.className = "history-item-summary";

    const summaryMeta = document.createElement("div");
    summaryMeta.className = "history-item-summary-meta";

    const meta = document.createElement("p");
    meta.className = "history-meta";
    meta.textContent = `${ui.historyCreatedAtLabel}: ${formatHistoryTimestamp(entry.createdAt)}`;

    const preview = document.createElement("p");
    preview.className = "history-preview result-body";
    preview.textContent = truncatePreview(entry.mainTranslation || entry.text);

    summaryMeta.append(meta, preview);

    const direction = document.createElement("p");
    direction.className = "history-direction";
    direction.textContent = `${ui.languageOptions[entry.sourceLang as "ja" | "vi"]} → ${ui.languageOptions[entry.targetLang as "ja" | "vi"]}`;

    summary.append(summaryMeta, direction);

    const toolbar = document.createElement("div");
    toolbar.className = "history-item-toolbar";
    toolbar.setAttribute("role", "toolbar");
    toolbar.setAttribute("aria-label", ui.historyActionsHeading);

    const reuseButton = document.createElement("button");
    reuseButton.type = "button";
    reuseButton.className = "history-toolbar-button icon-action-button";
    reuseButton.dataset.historyAction = "reuse";
    reuseButton.dataset.historyId = entry.id;
    reuseButton.textContent = "↩";
    setButtonTooltip(reuseButton, ui.tooltipHistoryReuse);

    const copyButton = document.createElement("button");
    copyButton.type = "button";
    copyButton.className = "copy-button history-toolbar-button icon-action-button";
    copyButton.dataset.copyKind = "history";
    copyButton.dataset.historyId = entry.id;
    copyButton.dataset.defaultLabel = ui.copyLabel;
    copyButton.dataset.copiedLabelKey = "copiedLabel";
    copyButton.dataset.iconIdle = "⧉";
    copyButton.dataset.iconCopied = "✓";
    copyButton.dataset.tooltipIdleKey = "tooltipHistoryCopy";
    copyButton.dataset.tooltipCopiedKey = "copiedLabel";
    copyButton.textContent = "⧉";
    setButtonTooltip(copyButton, ui.tooltipHistoryCopy);

    const speakButton = document.createElement("button");
    speakButton.type = "button";
    speakButton.className = "voice-button history-toolbar-button icon-action-button";
    speakButton.dataset.voiceAction = "speak";
    speakButton.dataset.speakKind = "history";
    speakButton.dataset.historyId = entry.id;
    speakButton.dataset.defaultLabel = ui.speakLabel;
    speakButton.dataset.iconIdle = "🔊";
    speakButton.dataset.iconActive = "⏹";
    speakButton.dataset.tooltipIdleKey = "tooltipHistorySpeak";
    speakButton.dataset.tooltipActiveKey = "stopLabel";
    speakButton.textContent = "🔊";
    setButtonTooltip(speakButton, ui.tooltipHistorySpeak);

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "history-toolbar-button icon-action-button is-destructive";
    deleteButton.dataset.historyAction = "delete";
    deleteButton.dataset.historyId = entry.id;
    deleteButton.textContent = "🗑";
    setButtonTooltip(deleteButton, ui.tooltipHistoryDelete);

    toolbar.append(reuseButton, copyButton, speakButton, deleteButton);

    const body = document.createElement("div");
    body.className = "history-item-body";

    const detailsGrid = document.createElement("dl");
    detailsGrid.className = "history-grid";
    detailsGrid.append(
      createHistoryRow(ui.historySourceLabel, entry.text),
      createHistoryRow(ui.historyTargetLabel, entry.mainTranslation),
      createHistoryRow(ui.sourceLangLabel, ui.languageOptions[entry.sourceLang as "ja" | "vi"]),
      createHistoryRow(ui.targetLangLabel, ui.languageOptions[entry.targetLang as "ja" | "vi"]),
      createHistoryRow(ui.modeLabel, ui.modeOptions[entry.mode as "daily" | "work" | "customer-service" | "hospital"]),
      createHistoryRow(ui.toneLabel, ui.toneOptions[entry.tone as "casual" | "normal" | "polite"])
    );

    body.append(detailsGrid);
    detailsElement.append(summary, toolbar, body);
    detailsElement.addEventListener("toggle", () => {
      setHistoryDisclosureState(detailsElement);
    });
    setHistoryDisclosureState(detailsElement);
    historyListElement.appendChild(detailsElement);
  }
}

function prependHistoryEntry(entry: typeof historyList[number]) {
  const nextEntries = [entry, ...historyList].slice(0, 20);

  if (!saveHistory(nextEntries)) {
    setError(getUi().errorHistorySaveFailed);
    return;
  }

  historyList = nextEntries;
  renderHistory(historyList);
  updateButtonLabels();
  setupVoiceControls();
}

function deleteHistoryEntry(id: string) {
  const nextEntries = historyList.filter((entry) => entry.id !== id);
  if (nextEntries.length === historyList.length) {
    return;
  }

  if (!saveHistory(nextEntries)) {
    setError(getUi().errorHistorySaveFailed);
    return;
  }

  historyList = nextEntries;
  renderHistory(historyList);
  updateButtonLabels();
  setupVoiceControls();
}

function clearHistory() {
  if (!window.confirm(getUi().historyConfirmClearAll)) {
    return;
  }

  if (!saveHistory([])) {
    setError(getUi().errorHistorySaveFailed);
    return;
  }

  historyList = [];
  renderHistory(historyList);
  updateButtonLabels();
  setupVoiceControls();
}

function reuseHistoryEntry(id: string) {
  const entry = historyList.find((item) => item.id === id);
  if (!entry) {
    return;
  }

  if (sourceLang) sourceLang.value = entry.sourceLang;
  if (targetLang) targetLang.value = entry.targetLang;
  if (sourceText) sourceText.value = entry.text;
  if (mode) mode.value = entry.mode;
  if (tone) tone.value = entry.tone;

  stopSpeaking();
  if (activeRecognition) {
    activeRecognition.abort();
  }

  syncLocaleWithSource();
  setupVoiceControls();

  lastTranslationRequest = {
    sourceLang: entry.sourceLang,
    targetLang: entry.targetLang,
    text: entry.text,
    mode: entry.mode,
    tone: entry.tone
  };
  lastMainTranslation = entry.mainTranslation;
  resetDetailsState();
  if (mainTranslation) mainTranslation.textContent = entry.mainTranslation;
  if (resultCard) resultCard.classList.remove("is-hidden");
  resultCard?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderList(listElement: HTMLUListElement | null, values: unknown) {
  if (!listElement) return;

  listElement.innerHTML = "";

  if (!Array.isArray(values) || values.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.textContent = getUi().emptyList;
    listElement.appendChild(emptyItem);
    return;
  }

  for (const value of values) {
    const item = document.createElement("li");
    item.textContent = String(value);
    listElement.appendChild(item);
  }
}

function listToText(listElement: HTMLUListElement | null) {
  if (!listElement) return "";
  const items = Array.from(listElement.querySelectorAll("li"));
  return items
    .map((item) => item.textContent?.trim() || "")
    .filter((value) => value.length > 0 && !emptyListValues.includes(value))
    .join("\n");
}

function getCopyText(kind: string, button?: HTMLButtonElement | null) {
  if (kind === "source" && sourceText) {
    return sourceText.value.trim();
  }

  if (kind === "main" && mainTranslation) {
    return (mainTranslation.textContent || "").trim();
  }

  if (kind === "alternatives") {
    return listToText(alternativesList);
  }

  if (kind === "nuance") {
    return listToText(nuanceNotesList);
  }

  if (kind === "replies") {
    return listToText(suggestedRepliesList);
  }

  if (kind === "history" && button) {
    const entry = getHistoryEntry(button.dataset.historyId || "");
    return entry?.mainTranslation?.trim() || "";
  }

  return "";
}

function getSpeechLanguage(kind: string, button?: HTMLButtonElement | null) {
  const language =
    kind === "source"
      ? speechLanguageMap[sourceLang?.value || ""]
      : speechLanguageMap[targetLang?.value || ""];

  if (kind === "history" && button) {
    const entry = getHistoryEntry(button.dataset.historyId || "");
    const historyLanguage = entry ? speechLanguageMap[entry.targetLang] : null;
    return historyLanguage || "ja-JP";
  }

  return language || "ja-JP";
}

function setVoiceButtonState(button: HTMLButtonElement, isActive: boolean) {
  const defaultLabel = button.dataset.defaultLabel || "";
  const ui = getUi();
  const visualLabel = isActive
    ? button.dataset.iconActive || ui.stopLabel
    : button.dataset.iconIdle || defaultLabel;
  const tooltipLabel = isActive
    ? getUiText(button.dataset.tooltipActiveKey || "", ui.stopLabel)
    : getUiText(button.dataset.tooltipIdleKey || "", defaultLabel);

  button.textContent = visualLabel;
  setButtonTooltip(button, tooltipLabel);
  button.classList.toggle("is-active", isActive);
}

function setCopyButtonState(button: HTMLButtonElement, isCopied: boolean) {
  const ui = getUi();
  const defaultLabel = button.dataset.defaultLabel || ui.copyLabel;
  const copiedLabel = getUiText(button.dataset.copiedLabelKey || "", ui.copiedLabel);
  const visualLabel = isCopied
    ? button.dataset.iconCopied || copiedLabel
    : button.dataset.iconIdle || defaultLabel;
  const tooltipLabel = isCopied
    ? getUiText(button.dataset.tooltipCopiedKey || "", copiedLabel)
    : getUiText(button.dataset.tooltipIdleKey || "", defaultLabel);

  button.textContent = visualLabel;
  setButtonTooltip(button, tooltipLabel);
  button.classList.toggle("is-copied", isCopied);
}

function resetActiveSpeakButton() {
  if (!(activeSpeakButton instanceof HTMLButtonElement)) {
    activeSpeakButton = null;
    return;
  }

  setVoiceButtonState(activeSpeakButton, false);
  activeSpeakButton = null;
}

function resetActiveListenButton() {
  if (!(activeListenButton instanceof HTMLButtonElement)) {
    activeListenButton = null;
    return;
  }

  setVoiceButtonState(activeListenButton, false);
  activeListenButton = null;
}

function getPreferredVoice(language: string) {
  if (!Array.isArray(speechVoices) || speechVoices.length === 0) {
    return null;
  }

  const exactMatch = speechVoices.find((voice) => voice.lang === language);
  if (exactMatch) {
    return exactMatch;
  }

  const prefix = language.split("-")[0].toLowerCase();
  return speechVoices.find((voice) => voice.lang.toLowerCase().startsWith(prefix)) || null;
}

function refreshSpeechVoices() {
  if (!speechSynthesisApi) {
    speechVoices = [];
    return;
  }

  speechVoices = speechSynthesisApi.getVoices();
}

function stopSpeaking() {
  if (!speechSynthesisApi) {
    return;
  }

  speechSynthesisApi.cancel();
  resetActiveSpeakButton();
}

function stopListening() {
  if (!activeRecognition) {
    return;
  }

  activeRecognition.stop();
  setVoiceStatus(getUi().voiceStatusStopped);
}

function describeRecognitionError(errorCode: string) {
  const ui = getUi();

  if (errorCode === "aborted") {
    return "";
  }

  if (errorCode === "audio-capture") {
    return ui.errorMicUnavailable;
  }

  if (errorCode === "not-allowed") {
    return ui.errorMicNotAllowed;
  }

  if (errorCode === "no-speech") {
    return ui.errorNoSpeech;
  }

  if (errorCode === "language-not-supported") {
    return ui.errorLanguageNotSupported;
  }

  return ui.errorListenFailed;
}

async function speakText(button: HTMLButtonElement, kind: string) {
  const ui = getUi();

  if (!speechSynthesisApi || typeof SpeechSynthesisUtterance === "undefined") {
    setError(ui.errorSpeechUnsupported);
    return;
  }

  if (activeSpeakButton === button && speechSynthesisApi.speaking) {
    stopSpeaking();
    setVoiceStatus(ui.voiceStatusStopped);
    return;
  }

  const text = getCopyText(kind, button);
  if (!text) {
    setError(ui.errorSpeakEmpty);
    return;
  }

  setError("");
  stopSpeaking();

  const utterance = new SpeechSynthesisUtterance(text);
  const language = getSpeechLanguage(kind, button);
  const preferredVoice = getPreferredVoice(language);

  utterance.lang = language;
  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  utterance.onstart = () => {
    activeSpeakButton = button;
    setVoiceButtonState(button, true);
    setVoiceStatus(getUi().voiceStatusReading);
  };

  utterance.onend = () => {
    resetActiveSpeakButton();
    setVoiceStatus(getUi().voiceStatusReadDone);
  };

  utterance.onerror = () => {
    resetActiveSpeakButton();
    setError(getUi().errorSpeakFailed);
  };

  speechSynthesisApi.speak(utterance);
}

function startListening(button: HTMLButtonElement) {
  const ui = getUi();

  if (!SpeechRecognitionClass) {
    setError(ui.errorListenUnsupported);
    return;
  }

  if (activeListenButton === button && activeRecognition) {
    stopListening();
    return;
  }

  if (activeRecognition) {
    activeRecognition.abort();
  }

  const recognition = new SpeechRecognitionClass();
  recognition.lang = getSpeechLanguage("source");
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;
  recognition.continuous = false;

  recognition.onstart = () => {
    activeRecognition = recognition;
    activeListenButton = button;
    setVoiceButtonState(button, true);
    setError("");
    setVoiceStatus(getUi().voiceStatusListening);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recognition.onresult = (event: any) => {
    let transcript = "";

    for (let index = 0; index < event.results.length; index += 1) {
      transcript += event.results[index][0]?.transcript || "";
    }

    if (sourceText) sourceText.value = transcript.trim();

    if (transcript.trim()) {
      setVoiceStatus(getUi().voiceStatusCaptured);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recognition.onerror = (event: any) => {
    const message = describeRecognitionError(event.error);
    if (message) {
      setError(message);
    }
  };

  recognition.onend = () => {
    activeRecognition = null;
    resetActiveListenButton();
  };

  recognition.start();
}

function setupVoiceControls() {
  const canSpeak =
    Boolean(speechSynthesisApi) && typeof SpeechSynthesisUtterance !== "undefined";
  const canListen = typeof SpeechRecognitionClass === "function";
  const ui = getUi();

  setVoiceStatus("");

  for (const button of getSpeakButtons()) {
    button.disabled = !canSpeak;
  }

  for (const button of getListenButtons()) {
    button.disabled = !canListen;
  }

  if (!canSpeak && !canListen) {
    setVoiceStatus(ui.voiceStatusUnsupportedAll);
    return;
  }

  if (!canSpeak) {
    setVoiceStatus(ui.voiceStatusUnsupportedSpeak);
    return;
  }

  if (!canListen) {
    setVoiceStatus(ui.voiceStatusUnsupportedListen);
  }
}

async function handleCopyButton(button: HTMLButtonElement) {
  const copyKind = button.dataset.copyKind || "";
  const copyText = getCopyText(copyKind, button);
  if (!copyText) {
    setError(getUi().errorCopyEmpty);
    return;
  }

  try {
    await writeClipboard(copyText);
    setError("");
    flashCopiedState(button);
  } catch {
    setError(getUi().errorCopyFailed);
  }
}

async function writeClipboard(text: string) {
  if (!navigator.clipboard || !window.isSecureContext) {
    throw new Error("clipboard_unavailable");
  }

  await navigator.clipboard.writeText(text);
}

function flashCopiedState(button: HTMLButtonElement) {
  const previousTimer = copyTimers.get(button);
  if (previousTimer) {
    clearTimeout(previousTimer);
  }

  setCopyButtonState(button, true);

  const nextTimer = setTimeout(() => {
    setCopyButtonState(button, false);
    copyTimers.delete(button);
  }, 1200);

  copyTimers.set(button, nextTimer);
}

async function parseResponse(response: Response): Promise<Record<string, unknown> | null> {
  let payload: Record<string, unknown> | null = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const apiError = payload && typeof payload === "object" && "error" in payload ? payload.error : null;
    const apiMessage =
      apiError &&
      typeof apiError === "object" &&
      "message" in apiError &&
      typeof apiError.message === "string"
        ? apiError.message
        : `Request failed (${response.status})`;

    throw new Error(apiMessage);
  }

  return payload;
}

function showResult(translateData: Record<string, unknown>) {
  const mainText = typeof translateData.mainTranslation === "string" ? translateData.mainTranslation : "";
  if (mainTranslation) mainTranslation.textContent = mainText;
  lastMainTranslation = mainText;
  resetDetailsState();
  if (resultCard) resultCard.classList.remove("is-hidden");
}

function showDetails(translationDetails: Record<string, unknown>) {
  renderList(alternativesList, translationDetails.alternatives as string[] | undefined);
  renderList(nuanceNotesList, translationDetails.nuanceNotes as string[] | undefined);
  renderList(suggestedRepliesList, translationDetails.suggestedReplies as string[] | undefined);

  detailsLoaded = true;
  detailsLoading = false;
  if (detailsContainer) detailsContainer.classList.remove("is-hidden");
  updateDetailsControls();
}

async function loadTranslationDetails() {
  if (detailsLoaded || detailsLoading || !lastTranslationRequest || !lastMainTranslation) {
    return;
  }

  detailsLoading = true;
  updateDetailsControls();
  setError("");

  try {
    const detailsResponse = await fetch("/api/translate-details", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sourceLang: lastTranslationRequest.sourceLang,
        targetLang: lastTranslationRequest.targetLang,
        originalText: lastTranslationRequest.text,
        mainTranslation: lastMainTranslation,
        mode: lastTranslationRequest.mode,
        tone: lastTranslationRequest.tone
      })
    });

    const translationDetails = await parseResponse(detailsResponse);
    if (translationDetails) {
      showDetails(translationDetails);
    }
  } catch (error) {
    detailsLoading = false;
    updateDetailsControls();
    const message = error instanceof Error ? error.message : getUi().errorDetailsFailed;
    setError(message);
  }
}

function syncLocaleWithSource(persist = true) {
  const nextLocale = isLocale(sourceLang?.value || "") ? sourceLang?.value || defaultLocale : defaultLocale;
  applyLocale(nextLocale, persist);
}

function restorePreferences() {
  const storedSourceLang = getStoredValue(storageKeys.sourceLang);
  const storedTheme = getStoredValue(storageKeys.theme);

  if (sourceLang instanceof HTMLSelectElement && isLocale(storedSourceLang || "")) {
    sourceLang.value = storedSourceLang || defaultLocale;
    if (targetLang instanceof HTMLSelectElement && targetLang.value === storedSourceLang) {
      targetLang.value = storedSourceLang === "ja" ? "vi" : "ja";
    }
  }

  const resolvedTheme = storedTheme && isTheme(storedTheme) ? storedTheme : defaultTheme;
  applyTheme(resolvedTheme, false);
}

// Event Listeners
swapButton?.addEventListener("click", () => {
  if (!sourceLang || !targetLang) return;
  const currentSource = sourceLang.value;
  sourceLang.value = targetLang.value;
  targetLang.value = currentSource;
  stopSpeaking();
  if (activeRecognition) {
    activeRecognition.abort();
  }
  if (sourceLang instanceof HTMLSelectElement && isLocale(sourceLang.value)) {
    setStoredValue(storageKeys.sourceLang, sourceLang.value);
  }
  setupVoiceControls();
});

sourceLang?.addEventListener("change", () => {
  if (sourceLang instanceof HTMLSelectElement && isLocale(sourceLang.value)) {
    setStoredValue(storageKeys.sourceLang, sourceLang.value);
  }
  setupVoiceControls();
});

themeToggle?.addEventListener("click", () => {
  applyTheme(currentTheme === "dark" ? "light" : "dark");
});

localeToggle?.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement) || !target.dataset.locale) {
    return;
  }
  applyLocale(target.dataset.locale, true);
});

form?.addEventListener("click", async (event) => {
  const target = event.target;
  if (!(target instanceof Element)) {
    return;
  }

  const voiceButton = target.closest('[data-voice-action="speak"], [data-voice-action="listen"]');
  if (!(voiceButton instanceof HTMLButtonElement)) {
    return;
  }

  if (voiceButton.dataset.voiceAction === "speak") {
    const speakKind = voiceButton.dataset.speakKind || "";
    await speakText(voiceButton, speakKind);
    return;
  }

  if (voiceButton.dataset.voiceAction === "listen") {
    startListening(voiceButton);
  }
});

resultCard?.addEventListener("click", async (event) => {
  const target = event.target;
  if (!(target instanceof Element)) {
    return;
  }

  const detailsButton = target.closest("[data-load-details]");
  if (detailsButton instanceof HTMLButtonElement) {
    await loadTranslationDetails();
    return;
  }

  const voiceButton = target.closest('[data-voice-action="speak"]');
  if (voiceButton instanceof HTMLButtonElement) {
    const speakKind = voiceButton.dataset.speakKind || "";
    await speakText(voiceButton, speakKind);
    return;
  }

  const button = target.closest(".copy-button");
  if (!(button instanceof HTMLButtonElement)) {
    return;
  }

  await handleCopyButton(button);
});

if (historySection) {
  historySection.addEventListener("click", async (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    if (target.closest("#clearHistoryButton")) {
      clearHistory();
      return;
    }

    const voiceButton = target.closest('[data-voice-action="speak"]');
    if (voiceButton instanceof HTMLButtonElement) {
      const speakKind = voiceButton.dataset.speakKind || "";
      await speakText(voiceButton, speakKind);
      return;
    }

    const copyButton = target.closest(".copy-button");
    if (copyButton instanceof HTMLButtonElement) {
      await handleCopyButton(copyButton);
      return;
    }

    const actionButton = target.closest("[data-history-action]");
    if (!(actionButton instanceof HTMLButtonElement)) {
      return;
    }

    const action = actionButton.dataset.historyAction;
    const id = actionButton.dataset.historyId || "";
    if (!id) {
      return;
    }

    if (action === "reuse") {
      reuseHistoryEntry(id);
      return;
    }

    if (action === "delete") {
      deleteHistoryEntry(id);
    }
  });
}

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  setError("");

  const text = sourceText?.value.trim() || "";
  if (!text) {
    setError(getUi().errorInputRequired);
    return;
  }

  if (!sourceLang || !targetLang || !mode || !tone) {
    setError(getUi().errorTranslateFailed);
    return;
  }

  const translatePayload = {
    sourceLang: sourceLang.value,
    targetLang: targetLang.value,
    text,
    mode: mode.value,
    tone: tone.value
  };

  setLoading(true);
  stopSpeaking();
  if (activeRecognition) {
    activeRecognition.abort();
  }
  lastTranslationRequest = translatePayload;
  lastMainTranslation = "";
  resetDetailsState();
  if (resultCard) resultCard.classList.add("is-hidden");

  try {
    const translateResponse = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(translatePayload)
    });

    const translateData = await parseResponse(translateResponse);
    if (translateData) {
      showResult(translateData);
      prependHistoryEntry(createHistoryEntry(translatePayload, translateData));
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : getUi().errorTranslateFailed;
    setError(message);
  } finally {
    setLoading(false);
  }
});

// Initialize
restorePreferences();
historyList = loadHistory();
renderHistory(historyList);
resetDetailsState();
refreshSpeechVoices();
if (speechSynthesisApi) {
  speechSynthesisApi.onvoiceschanged = refreshSpeechVoices;
}
setupVoiceControls();
