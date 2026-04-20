export const HISTORY_LIMIT = 100;

function asPinned(value) {
  return value === true;
}

export function applyHistoryLimit(entries, limit = HISTORY_LIMIT) {
  if (!Array.isArray(entries)) {
    return [];
  }

  const nextEntries = entries.slice();
  while (nextEntries.length > limit) {
    let removeIndex = -1;

    for (let index = nextEntries.length - 1; index > 0; index -= 1) {
      if (!asPinned(nextEntries[index]?.pinned)) {
        removeIndex = index;
        break;
      }
    }

    nextEntries.splice(removeIndex === -1 ? nextEntries.length - 1 : removeIndex, 1);
  }

  return nextEntries;
}

export function normalizeHistoryEntries(entries, limit = HISTORY_LIMIT) {
  if (!Array.isArray(entries)) {
    return [];
  }

  return applyHistoryLimit(entries.map((entry) => ({
    ...entry,
    pinned: asPinned(entry?.pinned)
  })), limit);
}

export function toggleHistoryPinned(entries, id) {
  if (!Array.isArray(entries)) {
    return [];
  }

  return entries.map((entry) => entry.id === id
    ? { ...entry, pinned: !asPinned(entry.pinned) }
    : entry);
}
