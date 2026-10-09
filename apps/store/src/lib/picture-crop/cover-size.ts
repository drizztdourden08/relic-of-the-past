/* @layer store-site @kind logic */
import type { Size } from './picture-crop.type';

const coverSize = (picture: Size, widthOverHeight: number): Size =>
  (picture.width / picture.height > widthOverHeight
    ? { width: picture.height * widthOverHeight, height: picture.height }
    : { width: picture.width, height: picture.width / widthOverHeight });

export { coverSize };
