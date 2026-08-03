/* @layer renderer-components @kind logic */
/**
 * What the table as a whole is sorted and grouped by, in words.
 *
 * The headers used to carry this themselves: a rank number beside a caret, a
 * flag glyph beside a grouped column's name. Both were tiny, both cost the
 * label width it could not spare, and neither could say the ONE thing a reader
 * actually wants out of a multi-column sort — the whole order, in order. It
 * then spent a while living in every column's own ⋯ menu, worded once but
 * rendered thirty times over; it now sits once in the footer instead, under
 * the table rather than inside any one column's chrome.
 *
 * It reads the table's full state, not any one column's, so it says the same
 * thing regardless of where it is asked from — the order is a fact about the
 * table, and a per-column half of it is the thing that was confusing to begin
 * with.
 *
 * Pure text, deliberately: no element, no menu shape, nothing React. The
 * wording is the part worth pinning down in a test, and it stays testable
 * without a DOM.
 */
import type { SortEntry } from '../../../data/table/types';

interface SortGroupInput {
  /** Every sort level, outermost (highest priority) first. */
  sort: readonly SortEntry[];
  /** Every grouping level, outermost first. */
  groupBy: readonly string[];
  /** How a path is spelled in the header it belongs to, renames included. */
  labelOf: (path: string) => string;
}

interface SortGroupSummary {
  /** e.g. `Sorted: Kind (1st, ascending), Status (2nd, descending)` */
  sorted?: string;
  /** e.g. `Grouped by: Kind, then Status` */
  grouped?: string;
}

const DIR_WORD = { asc: 'ascending', desc: 'descending' } as const;

/**
 * Positions read as words because the number alone was what nobody could
 * decode on the header: `2` beside a caret is not obviously "second key".
 * The teens are the exception every naive suffix table gets wrong.
 */
const ordinal = (n: number): string => {
  const teen = n % 100 >= 11 && n % 100 <= 13;
  const ones = n % 10;
  if (teen) return `${n}th`;
  if (ones === 1) return `${n}st`;
  if (ones === 2) return `${n}nd`;
  if (ones === 3) return `${n}rd`;
  return `${n}th`;
};

/*
 * A single sort level has no rank worth saying — "1st" beside the only entry
 * in the list is noise, and the old badge had the same rule for the same
 * reason. Two or more, and the position is the whole point of the sentence.
 */
const sortedLine = (sort: readonly SortEntry[], labelOf: (path: string) => string): string | undefined => {
  if (sort.length === 0) return undefined;
  const parts = sort.map((entry, at) => {
    const rank = sort.length > 1 ? `${ordinal(at + 1)}, ` : '';
    return `${labelOf(entry.path)} (${rank}${DIR_WORD[entry.dir]})`;
  });
  return `Sorted: ${parts.join(', ')}`;
};

/* "then" rather than a comma: grouping NESTS, and a flat list reads as if the
   levels were peers. */
const groupedLine = (groupBy: readonly string[], labelOf: (path: string) => string): string | undefined => {
  if (groupBy.length === 0) return undefined;
  return `Grouped by: ${groupBy.map((path) => labelOf(path)).join(', then ')}`;
};

const summarizeSortGroup = (input: SortGroupInput): SortGroupSummary => {
  const { sort, groupBy, labelOf } = input;
  const summary: SortGroupSummary = {};
  const sorted = sortedLine(sort, labelOf);
  const grouped = groupedLine(groupBy, labelOf);

  if (sorted !== undefined) summary.sorted = sorted;
  if (grouped !== undefined) summary.grouped = grouped;
  return summary;
};

/*
 * Both halves as ONE line, for the footer, which reports the table once
 * rather than in a menu with room for two separate rows. When neither half
 * is set, render a placeholder to keep the left slot occupied so the right
 * side (count + menu) never shifts position.
 */
const summaryLine = (summary: SortGroupSummary): string => {
  const parts = [summary.sorted, summary.grouped].filter((line): line is string => Boolean(line));
  return parts.length > 0 ? parts.join('   ·   ') : 'No sorting or grouping';
};

export { summarizeSortGroup, summaryLine };
export type { SortGroupInput, SortGroupSummary };
