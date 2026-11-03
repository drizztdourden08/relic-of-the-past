/* @layer renderer-hud @kind logic */
const loadImage = (src: string): Promise<HTMLImageElement> => new Promise((resolve, reject) => {
  const img = new Image();
  img.onload = () => resolve(img);
  img.onerror = () => reject(new Error(`image failed to load: ${src}`));
  img.src = src;
});

export { loadImage };
