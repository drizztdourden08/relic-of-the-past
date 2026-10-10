/* @layer store-site @kind logic */
import { cropAt } from '../picture-crop/crop-at';
import type { CropRect } from '../picture-crop/picture-crop.type';
import type { Picture, PictureSpec } from './resize-image.type';
import { QUALITIES_BEST_FIRST } from './resize-image.constants';

const loadBitmap = (file: Blob): Promise<ImageBitmap> =>
  createImageBitmap(file).catch(() => {
    throw new Error('This file is not a picture the browser can read.');
  });

const drawCrop = (bitmap: ImageBitmap, spec: PictureSpec, crop: CropRect): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.width = spec.width;
  canvas.height = spec.height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('The browser could not draw the picture.');
  context.imageSmoothingQuality = 'high';
  context.drawImage(bitmap, crop.x, crop.y, crop.width, crop.height, 0, 0, spec.width, spec.height);
  return canvas;
};

const encode = (canvas: HTMLCanvasElement, quality: number): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob && blob.type === 'image/webp') resolve(blob);
      else reject(new Error('This browser cannot save webp pictures. Try another browser.'));
    }, 'image/webp', quality);
  });

const resizeToWebp = async (file: Blob, spec: PictureSpec, crop?: CropRect): Promise<Picture> => {
  const bitmap = await loadBitmap(file);
  try {
    const canvas = drawCrop(bitmap, spec, crop ?? cropAt(bitmap, spec.width / spec.height));
    for (const quality of QUALITIES_BEST_FIRST) {
      const blob = await encode(canvas, quality);
      if (blob.size <= spec.bytes) return { blob, width: spec.width, height: spec.height };
    }
    throw new Error('This picture stays too large even at low quality. Try a simpler one.');
  } finally {
    bitmap.close();
  }
};

export { resizeToWebp };
export type { PictureSpec, Picture } from './resize-image.type';
