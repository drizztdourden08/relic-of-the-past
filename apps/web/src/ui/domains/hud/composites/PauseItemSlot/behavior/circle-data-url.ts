/* @layer renderer-hud @kind logic */
const generateCircleDataUrl = (): string => {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#00ff00';
  const cx = 15.5, cy = 15.5;
  const innerR = 11, outerR = 13;
  for (let y = 0; y < 32; y++) {
    for (let x = 0; x < 32; x++) {
      const dx = x - cx, dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist >= innerR && dist <= outerR) {
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }
  return canvas.toDataURL();
};

let circleDataUrl: string | null = null;

const getCircleDataUrl = (): string => {
  if (!circleDataUrl) circleDataUrl = generateCircleDataUrl();
  return circleDataUrl;
};

export { getCircleDataUrl };
