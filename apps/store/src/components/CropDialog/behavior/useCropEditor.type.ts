/* @layer store-site @kind types */
import type { CropRect } from '../../../lib/picture-crop/picture-crop.type';

type CropEditorParams = {
  source: File;
  ratio: number;
  initial: CropRect | null;
};

export type { CropEditorParams };
