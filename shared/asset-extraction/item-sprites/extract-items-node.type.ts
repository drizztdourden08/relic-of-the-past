/* @layer shared-asset-extraction @kind types */
import type { SpriteCounts } from './extract-items';

interface ExtractionResult {
  total: number;
  counts: SpriteCounts;
  errors: string[];
  removedStale: number;
}

export type { ExtractionResult };
