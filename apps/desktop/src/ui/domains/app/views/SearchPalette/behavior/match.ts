/* @layer renderer-components @kind logic */
import type { SearchEntry } from '../SearchPalette.type';
import { scoreEntry } from './score-entry';

const rankEntries = (entries: SearchEntry[], query: string): SearchEntry[] => {
  const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return [];

  return entries
    .map((entry) => ({ entry, score: scoreEntry(entry, tokens) }))
    .filter((r): r is { entry: SearchEntry; score: number } => r.score !== null)
    .sort((a, b) => b.score - a.score || a.entry.label.length - b.entry.label.length)
    .map((r) => r.entry);
};

export { rankEntries };
