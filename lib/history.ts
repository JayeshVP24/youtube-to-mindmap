export interface HistoryEntry {
  id: string;
  url: string;
  videoId: string;
  title: string;
  markdown: string;
  createdAt: number;
}

const STORAGE_KEY = "mindmap-history";

/**
 * Extract title from the generated markdown (first # heading).
 */
export function extractTitle(markdown: string): string {
  const match = markdown.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : "Untitled Mindmap";
}

/**
 * Get all history entries from localStorage, sorted newest first.
 */
export function getHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const entries: HistoryEntry[] = JSON.parse(raw);
    return entries.sort((a, b) => b.createdAt - a.createdAt);
  } catch {
    return [];
  }
}

/**
 * Save a new history entry. Deduplicates by videoId (updates existing).
 */
export function saveToHistory(entry: Omit<HistoryEntry, "id" | "createdAt">): HistoryEntry {
  const entries = getHistory();

  // Check if this video already exists
  const existingIdx = entries.findIndex((e) => e.videoId === entry.videoId);

  const newEntry: HistoryEntry = {
    ...entry,
    id: existingIdx >= 0 ? entries[existingIdx].id : crypto.randomUUID(),
    createdAt: Date.now(),
  };

  if (existingIdx >= 0) {
    entries[existingIdx] = newEntry;
  } else {
    entries.unshift(newEntry);
  }

  // Keep max 50 entries
  const trimmed = entries.slice(0, 50);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // localStorage full -- remove oldest entries and retry
    const reduced = trimmed.slice(0, 25);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reduced));
  }

  return newEntry;
}

/**
 * Delete a history entry by id.
 */
export function deleteFromHistory(id: string): void {
  const entries = getHistory().filter((e) => e.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

/**
 * Clear all history.
 */
export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}
