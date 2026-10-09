/* @layer bridge-wasm @kind logic */
const encodeVia2dCopy = (canvas: HTMLCanvasElement): Promise<Blob | null> => {
  try {
    const copy = document.createElement('canvas');
    copy.width = canvas.width;
    copy.height = canvas.height;
    const ctx = copy.getContext('2d');
    if (!ctx) return Promise.resolve(null);
    ctx.drawImage(canvas, 0, 0);
    return new Promise((resolve) => {
      try {
        copy.toBlob((blob) => resolve(blob), 'image/png');
      } catch {
        resolve(null);
      }
    });
  } catch {
    return Promise.resolve(null);
  }
};

export { encodeVia2dCopy };
