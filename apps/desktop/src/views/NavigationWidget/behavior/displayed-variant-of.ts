/* @layer renderer-widgets @kind logic */
import type { FloodFillResult } from '@rotp/game-core';
import { wasmGetOverworldVariant } from '../../../game';
import type { OverworldVariantInfo } from '../../../game';

const displayedVariantOf = (
  isIndoors: boolean, result: FloodFillResult | null, variant: OverworldVariantInfo | null,
): OverworldVariantInfo | null => {
  if (isIndoors) return null;
  return result ? wasmGetOverworldVariant(result.screenIndex) : variant;
};

export { displayedVariantOf };
