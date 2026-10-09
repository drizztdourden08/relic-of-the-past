/* @layer renderer-app @kind logic */
import { linesForPaths } from '@shared/game/recommendations';
import type { DetailTab } from '@drizztdourden08/tessera/data';
import type { InspectorRow, InspectorSource } from '../../DataInspector.type';
import { NO_LINES } from './recommendations.constants';
import { sourceTextFor } from './source-text-for';

const highlightedLinesFor = (
  source: InspectorSource,
  record: InspectorRow | undefined,
  tab: DetailTab,
  paths: readonly string[],
): readonly number[] => {
  if (!record || tab === 'editor' || paths.length === 0) return NO_LINES;
  return linesForPaths(sourceTextFor(source, record, tab), paths);
};

export { highlightedLinesFor };
