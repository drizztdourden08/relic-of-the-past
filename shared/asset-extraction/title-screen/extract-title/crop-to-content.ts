/* @layer shared-asset-extraction @kind logic */
import { ImageBuffer } from '../../graphics/png-writer';

const cropToContent = (img: ImageBuffer): ImageBuffer => {
  let left = img.width, top = img.height, right = -1, bottom = -1;
  for (let y = 0; y < img.height; y += 1) {
    for (let x = 0; x < img.width; x += 1) {
      if (img.data[(y * img.width + x) * 4 + 3] === 0) continue;
      left = Math.min(left, x); right = Math.max(right, x);
      top = Math.min(top, y); bottom = Math.max(bottom, y);
    }
  }
  if (right < 0) return new ImageBuffer(1, 1);
  const out = new ImageBuffer(right - left + 1, bottom - top + 1);
  for (let y = top; y <= bottom; y += 1) {
    img.data.copy(out.data, (y - top) * out.width * 4, (y * img.width + left) * 4, (y * img.width + right + 1) * 4);
  }
  return out;
};

export { cropToContent };
