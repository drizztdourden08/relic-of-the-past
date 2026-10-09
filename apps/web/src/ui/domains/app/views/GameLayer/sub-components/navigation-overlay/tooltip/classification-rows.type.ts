/* @layer renderer-components @kind types */
import type { TileClassification } from '@shared/game/navigation/tile-classification';

interface ClassificationRowsProps {
  attr: number;
  classification: TileClassification;
  canPass: boolean | null;
}

export type { ClassificationRowsProps };
