/* @layer renderer-app @kind logic */
/**
 * Which lines a comparison pane marks as changed.
 *
 * The paths are computed ONCE for the pair — the difference between two records
 * is a property of the records, not of how either is written down — and then
 * resolved to line numbers separately for each side, on each tab. That second
 * step cannot be shared: the JSON and the emitter's TypeScript lay the same
 * record out differently, so the line a field sits on is not the same number in
 * the two texts, and neither is it the same number on the two SIDES when one of
 * them declares a field the other does not.
 *
 * The source text is produced by the same two functions the tab itself uses, so
 * the numbers always describe the text actually on screen.
 */
import { linesForPaths } from '@shared/game/recommendations';
import { jsonSourceOf, tsSourceOf } from '../record-source-text';
import type { DetailTab } from '@ds/data';
import type { InspectorRow, InspectorSource } from '../../DataInspector.type';

const NO_LINES: readonly number[] = [];

const sourceTextFor = (source: InspectorSource, record: InspectorRow, tab: DetailTab): string =>
  (tab === 'ts' ? tsSourceOf(source, record) : jsonSourceOf(record));

/**
 * Empty for the editor tab and for an absent record: neither has lines, and a
 * `create` has no left-hand record at all.
 */
const highlightedLinesFor = (
  source: InspectorSource,
  record: InspectorRow | undefined,
  tab: DetailTab,
  paths: readonly string[],
): readonly number[] => {
  if (!record || tab === 'editor' || paths.length === 0) return NO_LINES;
  return linesForPaths(sourceTextFor(source, record, tab), paths);
};

export { highlightedLinesFor, sourceTextFor };
