/* @layer store-site @kind logic */
import type { CropRect, Size } from './picture-crop.type';
import { coverSize } from './cover-size';

const zoomOf = (crop: CropRect, picture: Size, ratio: number): number => coverSize(picture, ratio).width / crop.width;

export { zoomOf };
