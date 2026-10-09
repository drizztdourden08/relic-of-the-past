/* @layer renderer-app @kind logic */
import type { NumberBounds } from '@ds/composites/RecordEditor';
import { BOUNDS_BY_COLLECTION } from './number-bounds.constants';
import { withoutIndices } from './without-indices';

const resolveNumberBoundsFor = (
  collectionKind: string,
  path: string,
  record: unknown,
): NumberBounds | undefined =>
  BOUNDS_BY_COLLECTION[collectionKind]?.(withoutIndices(path), record);

export { resolveNumberBoundsFor };
