/* @layer renderer-other @kind logic */
const canvasNativeHeight = (fallback: number, rowsPerLine = 2, canvasId = 'canvas'): number => {
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null;
  return canvas && canvas.height > 0 ? canvas.height / rowsPerLine : fallback;
};

export { canvasNativeHeight };
