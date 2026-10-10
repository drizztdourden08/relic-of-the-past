/* @layer renderer-hud @kind logic */
import type { RidgeOptions, SceneGeometry, SceneLayer } from '../scene.type';
import { itemAt } from '@app/checked-access';
import { wrapX } from './wrap-x';

const drawPiece = (ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, flip: boolean, rows: number): void => {
  if (!flip) {
    ctx.drawImage(img, 0, 0, img.width, rows, x, y, img.width, rows);
    return;
  }
  ctx.save();
  ctx.translate(x + img.width, y);
  ctx.scale(-1, 1);
  ctx.drawImage(img, 0, 0, img.width, rows, 0, 0, img.width, rows);
  ctx.restore();
};

const ridgeLayer = ({ pieces, placed, parallax, rows }: RidgeOptions, geometry: SceneGeometry): SceneLayer => {
  const { width } = geometry;
  const span = Math.max(...pieces.map((p) => p.width));
  return {
    draw: (ctx, { drift }) => {
      for (const p of placed) {
        const img = itemAt(pieces, p.variant);
        const x = Math.round(wrapX(p.x - drift * parallax, span, width));
        drawPiece(ctx, img, x, p.y, p.flip, rows ?? img.height);
      }
    },
  };
};

export { ridgeLayer };
