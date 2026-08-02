/* @layer renderer-components @kind logic */
/**
 * Every change the control can make to the value array, as plain functions.
 *
 * Each one returns the SAME array reference when there is nothing to do, so a
 * caller can tell "added" from "ignored" with `next !== value` and never has to
 * re-derive the rule. That is also what makes the whole set testable without a
 * browser, which this repo has no runtime for.
 */

interface FilterSuggestionsParams {
  suggestions: readonly string[];
  query: string;
  /** Values already applied — never worth offering a second time. */
  selected: readonly string[];
  limit?: number;
}

const normalizeTag = (raw: string): string => raw.trim();

/** Case-insensitive substring, the same match the searchable Select applies. */
const matchesQuery = (tag: string, query: string): boolean =>
  tag.toLowerCase().includes(query.toLowerCase());

const filterSuggestions = (params: FilterSuggestionsParams): readonly string[] => {
  const { suggestions, query, selected, limit } = params;

  const needle = normalizeTag(query);
  const taken = new Set(selected);
  const hits = suggestions.filter(
    (tag) => !taken.has(tag) && (needle === '' || matchesQuery(tag, needle)),
  );

  return limit != null && limit >= 0 ? hits.slice(0, limit) : hits;
};

/** True when the typed text is not one of the values already on offer. */
const isNewValue = (raw: string, suggestions: readonly string[]): boolean => {
  const tag = normalizeTag(raw);
  return tag !== '' && !suggestions.some((known) => known.toLowerCase() === tag.toLowerCase());
};

/**
 * What the typed text should actually commit as. An existing value wins
 * whenever the two differ only in case, so the vocabulary does not grow a
 * near-duplicate of a tag it already holds. Null when there is nothing to add.
 */
const resolveCommit = (raw: string, suggestions: readonly string[]): string | null => {
  const tag = normalizeTag(raw);
  if (tag === '') return null;
  return suggestions.find((known) => known.toLowerCase() === tag.toLowerCase()) ?? tag;
};

const addTag = (value: readonly string[], raw: string): readonly string[] => {
  const tag = normalizeTag(raw);
  if (tag === '' || value.includes(tag)) return value;
  return [...value, tag];
};

const removeAt = (value: readonly string[], index: number): readonly string[] =>
  index < 0 || index >= value.length ? value : value.filter((_, i) => i !== index);

const removeLast = (value: readonly string[]): readonly string[] =>
  value.length === 0 ? value : value.slice(0, -1);

export {
  addTag,
  filterSuggestions,
  isNewValue,
  matchesQuery,
  normalizeTag,
  removeAt,
  removeLast,
  resolveCommit,
};
export type { FilterSuggestionsParams };
