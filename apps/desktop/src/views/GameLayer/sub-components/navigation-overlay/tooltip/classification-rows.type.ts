/* @layer renderer-components @kind types */
import type { TileClassification } from '@rotp/navigation';

interface ClassificationRowsProps {
  attr: number;
  classification: TileClassification;
  canPass: boolean | null;
}

export type { ClassificationRowsProps };
