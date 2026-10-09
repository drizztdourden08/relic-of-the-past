/* @layer store-site @kind logic */
import type { CropRect, Size } from './picture-crop.type';
import { clampCrop } from './clamp-crop';

const moveCrop = (crop: CropRect, dx: number, dy: number, picture: Size): CropRect =>
  clampCrop({ ...crop, x: crop.x + dx, y: crop.y + dy }, picture);

export { moveCrop };
