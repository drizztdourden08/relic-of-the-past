/* @layer store-site @kind logic */
import type { CropRect, Size } from './picture-crop.type';
import { cropAt } from './crop-at';

const centreOf = (crop: CropRect): [number, number] => [crop.x + crop.width / 2, crop.y + crop.height / 2];

const zoomCrop = (crop: CropRect, zoom: number, picture: Size, ratio: number): CropRect =>
  cropAt(picture, ratio, zoom, centreOf(crop));

export { zoomCrop };
