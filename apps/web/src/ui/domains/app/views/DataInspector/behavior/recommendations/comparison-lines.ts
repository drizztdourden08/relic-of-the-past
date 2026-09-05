/* @layer renderer-app @kind logic */
/**
 * Which lines a comparison pane marks as changed. Paths are computed once for
 * the pair, then resolved to line numbers per side and per tab: JSON and the
 * emitted TypeScript lay a record out differently, and the two sides differ
 * when one declares a field the other does not. The source text comes from the
 * same functions the tab uses, so the numbers match what is on screen.
 */
import { linesForPaths } from '@shared/game/recommendations';
import { jsonSourceOf, tsSourceOf } from '../record-source-text';
import type { DetailTab } from '@ds/data';
import type { InspectorRow, InspectorSource } from '../../DataInspector.type';

const NO_LINES: readonly number[] = [];

const sourceTextFor = (source: InspectorSource, record: InspectorRow, tab: DetailTab): string =>
  (tab === 'ts' ? tsSourceOf(source, record) : jsonSourceOf(record));

/** Empty for the editor tab and for an absent record (a `create` has no left-hand record). */
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
