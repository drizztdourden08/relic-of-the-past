/* @layer shared-asset-extraction @kind logic */
import { itemAt } from '../../checked-read';
import { ImageBuffer } from '../../graphics/png-writer';
import type { TitleSource } from '../title-render';

const onBackdrop = (img: ImageBuffer, src: TitleSource): ImageBuffer => {
  const out = new ImageBuffer(img.width, img.height);
  const backdrop = itemAt(src.palette, 0, 'Title backdrop colour');
  for (let y = 0; y < img.height; y += 1) for (let x = 0; x < img.width; x += 1) out.putPixel(x, y, backdrop);
  out.paste(img, 0, 0);
  return out;
};

export { onBackdrop };
