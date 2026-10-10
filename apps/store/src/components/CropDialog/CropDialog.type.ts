/* @layer store-site @kind types */
import type { CropRect } from '../../picture-crop/picture-crop.type';

type CropDialogProps = {
  title: string;
  source: File;
  ratio: number;
  initial: CropRect | null;
  onApply: (crop: CropRect) => void;
  onClose: () => void;
};

export type { CropDialogProps };
