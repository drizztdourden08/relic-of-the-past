/* @layer renderer-hud @kind logic */
import { FRAME_W } from '@rotp/game-data';
import { MARK_SIZE, MARK_Y } from './draw-marks.constants';

const drawOpeningMark = (ctx: CanvasRenderingContext2D, img: HTMLImageElement, frameX: number, frameY: number): void => {
  ctx.drawImage(img, frameX + (FRAME_W - MARK_SIZE) / 2, frameY + MARK_Y, MARK_SIZE, MARK_SIZE);
};

export { drawOpeningMark };
