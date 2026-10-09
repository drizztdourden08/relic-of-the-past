/* @layer store-site @kind logic */
import type { CropRect, Size } from './picture-crop.type';
import { clamp } from './clamp';

const clampCrop = (crop: CropRect, picture: Size): CropRect => ({
  ...crop,
  x: clamp(crop.x, 0, picture.width - crop.width),
  y: clamp(crop.y, 0, picture.height - crop.height),
});

export { clampCrop };
