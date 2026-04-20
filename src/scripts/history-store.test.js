import assert from "node:assert/strict";
import test from "node:test";

import {
  HISTORY_LIMIT,
  applyHistoryLimit,
  normalizeHistoryEntries,
  toggleHistoryPinned
} from "./history-store.js";

function makeEntry(id, overrides = {}) {
  return {
    id,
    sourceLang: "ja",
    targetLang: "vi",
    text: `text-${id}`,
    mode: "daily",
    tone: "normal",
    mainTranslation: `translation-${id}`,
    createdAt: `2026-04-${String((Number.parseInt(String(id), 10) || 1) + 1).padStart(2, "0")}T00:00:00.000Z`,
    pinned: false,
    ...overrides
  };
}

test("exports the configured history limit", () => {
  assert.equal(HISTORY_LIMIT, 100);
});

test("normalizeHistoryEntries backfills pinned=false for legacy entries", () => {
  const legacyEntry = makeEntry("legacy");
  delete legacyEntry.pinned;

  const entries = normalizeHistoryEntries([
    makeEntry("pinned", { pinned: true }),
    legacyEntry
  ], 10);

  assert.equal(entries[0].pinned, true);
  assert.equal(entries[1].pinned, false);
});

test("applyHistoryLimit removes the oldest unpinned entry before older pinned entries", () => {
  const entries = applyHistoryLimit([
    makeEntry("fresh"),
    makeEntry("pinned-a", { pinned: true }),
    makeEntry("old-unpinned"),
    makeEntry("oldest-pinned", { pinned: true })
  ], 3);

  assert.deepEqual(entries.map((entry) => entry.id), [
    "fresh",
    "pinned-a",
    "oldest-pinned"
  ]);
});

test("applyHistoryLimit preserves a newly added entry when older items are all pinned", () => {
  const entries = applyHistoryLimit([
    makeEntry("fresh"),
    makeEntry("pinned-a", { pinned: true }),
    makeEntry("pinned-b", { pinned: true }),
    makeEntry("pinned-c", { pinned: true })
  ], 3);

  assert.deepEqual(entries.map((entry) => entry.id), [
    "fresh",
    "pinned-a",
    "pinned-b"
  ]);
});

test("toggleHistoryPinned only flips the requested entry", () => {
  const entries = toggleHistoryPinned([
    makeEntry("first"),
    makeEntry("second", { pinned: true })
  ], "first");

  assert.deepEqual(entries.map((entry) => ({
    id: entry.id,
    pinned: entry.pinned
  })), [
    { id: "first", pinned: true },
    { id: "second", pinned: true }
  ]);
});
