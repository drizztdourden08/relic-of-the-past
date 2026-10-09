/* @layer store-site @kind logic */
import type { CropRect, Size } from './picture-crop.type';
import { MAX_ZOOM } from './picture-crop.constants';
import { clamp } from './clamp';
import { clampCrop } from './clamp-crop';
import { coverSize } from './cover-size';

const cropAt = (picture: Size, ratio: number, zoom = 1, centre?: readonly [number, number]): CropRect => {
  const base = coverSize(picture, ratio);
  const scale = clamp(zoom, 1, MAX_ZOOM);
  const width = base.width / scale;
  const height = base.height / scale;
  const [cx, cy] = centre ?? [picture.width / 2, picture.height / 2];
  return clampCrop({ x: cx - width / 2, y: cy - height / 2, width, height }, picture);
};

export { cropAt };
