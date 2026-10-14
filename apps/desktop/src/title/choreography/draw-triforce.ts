/* @layer renderer-hud @kind logic */
import { MIRRORED_PIECE, PIECE_SIZE } from '@rotp/game-data';
import type { TitlePiece } from '@rotp/game-data';
import type { FrameOrigin, TriforcePicture } from './choreography.type';

const drawTriforce = (ctx: CanvasRenderingContext2D, picture: TriforcePicture, pieces: readonly TitlePiece[], at: FrameOrigin): void => {
  pieces.forEach((piece, k) => {
    const x = at.x + piece.x;
    const y = at.y + piece.y;
    if (k !== MIRRORED_PIECE) {
      ctx.drawImage(picture.canvas, x, y);
      return;
    }
    ctx.save();
    ctx.translate(x + PIECE_SIZE, y);
    ctx.scale(-1, 1);
    ctx.drawImage(picture.canvas, 0, 0);
    ctx.restore();
  });
};

export { drawTriforce };
