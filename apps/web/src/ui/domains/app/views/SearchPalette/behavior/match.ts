/* @layer renderer-components @kind logic */
/** Ranked substring matcher — no dependency. Every query token must match somewhere in an
 *  entry (AND across tokens); per-token scores sum across fields, label weighted highest,
 *  ties break on shorter label. Tuned so "sprite" surfaces the Graphics setting, the Data
 *  Manager tab, and the "Add a ROM" action together, ranked by relevance. */
import type { SearchEntry, SearchKind } from '../SearchPalette.type';

interface FieldWeights {
  exact: number;
  prefix: number;
  wordStart: number;
  substring: number;
}

const LABEL_WEIGHTS: FieldWeights = { exact: 100, prefix: 60, wordStart: 40, substring: 20 };
const KEYWORD_WEIGHTS: FieldWeights = { exact: 30, prefix: 20, wordStart: 15, substring: 8 };
const DESCRIPTION_WEIGHTS: FieldWeights = { exact: 10, prefix: 8, wordStart: 6, substring: 3 };
const BREADCRUMB_WEIGHTS: FieldWeights = { exact: 15, prefix: 10, wordStart: 8, substring: 4 };

// Screens/tabs are destinations in their own right, so a query like "data" should surface
// the Data Manager itself above a setting that merely mentions data in its description.
const KIND_BOOST: Record<SearchKind, number> = { screen: 6, tab: 6, action: 2, setting: 0 };

const escapeRegex = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const scoreField = (text: string | undefined, token: string, weights: FieldWeights): number => {
  if (!text) return 0;
  const value = text.toLowerCase();
  if (value === token) return weights.exact;
  if (value.startsWith(token)) return weights.prefix;
  if (new RegExp(`\\b${escapeRegex(token)}`).test(value)) return weights.wordStart;
  if (value.includes(token)) return weights.substring;
  return 0;
};

const scoreToken = (entry: SearchEntry, token: string): number => Math.max(
  scoreField(entry.label, token, LABEL_WEIGHTS),
  scoreField(entry.keywords, token, KEYWORD_WEIGHTS),
  scoreField(entry.description, token, DESCRIPTION_WEIGHTS),
  scoreField(entry.breadcrumb.join(' '), token, BREADCRUMB_WEIGHTS),
);

/** Returns null when the entry doesn't match every token — excluded by the caller. */
const scoreEntry = (entry: SearchEntry, tokens: string[]): number | null => {
  let total = KIND_BOOST[entry.kind];
  for (const token of tokens) {
    const score = scoreToken(entry, token);
    if (score === 0) return null;
    total += score;
  }
  return total;
};

const rankEntries = (entries: SearchEntry[], query: string): SearchEntry[] => {
  const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return [];

  return entries
    .map((entry) => ({ entry, score: scoreEntry(entry, tokens) }))
    .filter((r): r is { entry: SearchEntry; score: number } => r.score !== null)
    .sort((a, b) => b.score - a.score || a.entry.label.length - b.entry.label.length)
    .map((r) => r.entry);
};

export { rankEntries, scoreEntry };
