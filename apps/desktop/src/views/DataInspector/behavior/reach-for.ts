/* @layer renderer-app @kind logic */
import type { InspectorRow } from '../DataInspector.type';

const reachFor = (
  ordered: readonly InspectorRow[],
  selectedId: string | null,
  getId: (row: InspectorRow) => string,
): number => {
  if (!selectedId) return 0;
  const at = ordered.findIndex(row => getId(row) === selectedId);
  return at + 1;
};

export { reachFor };
