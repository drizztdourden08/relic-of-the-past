/* @layer shared-asset-extraction @kind logic */
import type { FontReference } from './font.type';

const byBaseFirst = (references: readonly FontReference[]): FontReference[] =>
  [...references].sort((left, right) => Number(right.isBase) - Number(left.isBase));

export { byBaseFirst };
