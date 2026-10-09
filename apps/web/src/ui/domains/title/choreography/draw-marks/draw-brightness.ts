/* @layer renderer-hud @kind logic */
const drawBrightness = (ctx: CanvasRenderingContext2D, brightness: number, width: number, height: number): void => {
  if (brightness >= 1) return;
  ctx.fillStyle = `rgba(0, 0, 0, ${1 - brightness})`;
  ctx.fillRect(0, 0, width, height);
};

export { drawBrightness };
