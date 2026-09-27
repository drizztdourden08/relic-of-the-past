/* @layer store-site @kind logic */
/**
 * A picture the author picked, made into the exact webp the store keeps: scaled to cover
 * the target size, centred, cropped to it, then encoded at the best quality that fits the
 * byte cap. Everything runs in the browser, so the bucket only ever sees the finished file.
 */
type PictureSpec = { width: number; height: number; bytes: number };

type Picture = { blob: Blob; width: number; height: number };

/** Tried in order until the file fits the cap. */
const QUALITIES = [0.9, 0.82, 0.74, 0.66, 0.58, 0.5];

const loadBitmap = (file: Blob): Promise<ImageBitmap> =>
  createImageBitmap(file).catch(() => {
    throw new Error('This file is not a picture the browser can read.');
  });

const drawCover = (bitmap: ImageBitmap, spec: PictureSpec): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.width = spec.width;
  canvas.height = spec.height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('The browser could not draw the picture.');
  const scale = Math.max(spec.width / bitmap.width, spec.height / bitmap.height);
  const drawnWidth = bitmap.width * scale;
  const drawnHeight = bitmap.height * scale;
  context.imageSmoothingQuality = 'high';
  context.drawImage(bitmap, (spec.width - drawnWidth) / 2, (spec.height - drawnHeight) / 2, drawnWidth, drawnHeight);
  return canvas;
};

const encode = (canvas: HTMLCanvasElement, quality: number): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob && blob.type === 'image/webp') resolve(blob);
      else reject(new Error('This browser cannot save webp pictures. Try another browser.'));
    }, 'image/webp', quality);
  });

const resizeToWebp = async (file: Blob, spec: PictureSpec): Promise<Picture> => {
  const bitmap = await loadBitmap(file);
  try {
    const canvas = drawCover(bitmap, spec);
    for (const quality of QUALITIES) {
      const blob = await encode(canvas, quality);
      if (blob.size <= spec.bytes) return { blob, width: spec.width, height: spec.height };
    }
    throw new Error('This picture stays too large even at low quality. Try a simpler one.');
  } finally {
    bitmap.close();
  }
};

export { resizeToWebp };
export type { PictureSpec, Picture };
