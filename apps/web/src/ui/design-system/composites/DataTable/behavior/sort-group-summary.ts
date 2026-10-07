/* @layer renderer-components @kind logic */
/** What the whole table is sorted and grouped by, in words. Pure text, so the wording is testable without a DOM. */
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

/** The teens are the exception every naive suffix table gets wrong. */
const ordinal = (n: number): string => {
  const teen = n % 100 >= 11 && n % 100 <= 13;
  const ones = n % 10;
  if (teen) return `${n}th`;
  if (ones === 1) return `${n}st`;
  if (ones === 2) return `${n}nd`;
  if (ones === 3) return `${n}rd`;
  return `${n}th`;
};

/* A single sort level gets no rank; "1st" beside the only entry is noise. */
const sortedLine = (sort: readonly SortEntry[], labelOf: (path: string) => string): string | undefined => {
  if (sort.length === 0) return undefined;
  const parts = sort.map((entry, at) => {
    const rank = sort.length > 1 ? `${ordinal(at + 1)}, ` : '';
    return `${labelOf(entry.path)} (${rank}${DIR_WORD[entry.dir]})`;
  });
  return `Sorted: ${parts.join(', ')}`;
};

/* "then", not a comma: grouping nests, and a flat list reads as peers. */
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

/* Both halves as one line for the footer. The placeholder keeps the left slot
   occupied so the count and menu never shift. */
const summaryLine = (summary: SortGroupSummary): string => {
  const parts = [summary.sorted, summary.grouped].filter((line): line is string => Boolean(line));
  return parts.length > 0 ? parts.join('   ·   ') : 'No sorting or grouping';
};

export { summarizeSortGroup, summaryLine };
export type { SortGroupInput, SortGroupSummary };
