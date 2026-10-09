/* @layer renderer-hud @kind logic */
import { DIM_FLASH_ALPHA, FLASH_ALPHA } from './draw-marks.constants';

const drawFlash = (ctx: CanvasRenderingContext2D, dim: boolean, width: number, height: number): void => {
  ctx.fillStyle = `rgba(255, 255, 255, ${dim ? DIM_FLASH_ALPHA : FLASH_ALPHA})`;
  ctx.fillRect(0, 0, width, height);
};

export { drawFlash };
