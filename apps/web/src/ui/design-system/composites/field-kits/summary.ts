/* @layer renderer-components @kind logic */
/**
 * One-line renderings of values that do not fit on one line. A table cell shows
 * the short form and carries the long form as its tooltip, so nothing is hidden
 * outright and nothing blows the row height out either.
 */
import { isNullish, toList, toText } from './coerce';

const PREVIEW_MAX = 120;
const ENTRY_MAX = 24;
const ENTRY_COUNT = 2;

const truncate = (text: string, max: number = PREVIEW_MAX): string =>
  (text.length > max ? `${text.slice(0, max - 1)}…` : text);

/** Cycle-safe; anything JSON refuses falls back to its String form. */
const toJson = (value: unknown): string => {
  const seen = new WeakSet<object>();
  try {
    const json = JSON.stringify(value, (_key, entry: unknown) => {
      if (typeof entry === 'object' && entry !== null) {
        if (seen.has(entry)) return '[circular]';
        seen.add(entry);
      }
      return entry;
    });
    return json ?? toText(value);
  } catch {
    return toText(value);
  }
};

/** A nested value collapsed to a marker, so a summary stays one level deep. */
const scalarText = (value: unknown): string => {
  if (typeof value !== 'object' || value === null) return toText(value);
  return Array.isArray(value) ? `[${value.length}]` : '{…}';
};

/** `first: 1, second: two, …` — enough to tell two records apart at a glance. */
const summarizeEntries = (value: unknown, limit: number = ENTRY_COUNT): string => {
  if (isNullish(value) || typeof value !== 'object') return toText(value);
  if (Array.isArray(value)) return summarizeList(value);
  const entries = Object.entries(value as Record<string, unknown>);
  if (!entries.length) return '{}';
  const head = entries
    .slice(0, limit)
    .map(([key, entry]) => `${key}: ${truncate(scalarText(entry), ENTRY_MAX)}`)
    .join(', ');
  return entries.length > limit ? `${head}, …` : head;
};

const summarizeList = (value: unknown): string =>
  truncate(toList(value).map(scalarText).join(', '));

/** Reads as a count, so a grouping bucket and a badge can share the wording. */
const countLabel = (count: number): string => {
  if (count === 0) return 'none';
  return count === 1 ? '1 item' : `${count} items`;
};

export { PREVIEW_MAX, countLabel, scalarText, summarizeEntries, summarizeList, toJson, truncate };
