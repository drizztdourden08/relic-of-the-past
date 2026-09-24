/* @layer renderer-hud @kind logic */
/**
 * A row of placed pieces that slides with the parallax and wraps around the canvas: the mountains
 * far back, the trees on the water line. Only the top rows of a piece can be drawn (the trees carry
 * a baked reflection below their trunks that the reflection layer replaces).
 */
import type { Placed, SceneGeometry, SceneLayer } from '../scene.type';

interface RidgeOptions {
  pieces: readonly HTMLImageElement[];
  placed: readonly Placed[];
  /** How much of the parallax travel this row takes; 1 is the front. */
  parallax: number;
  /** Rows of each piece to draw, from the top; the whole piece when omitted. */
  rows?: number;
}

/** Wraps a drifting x back into the canvas, keeping the piece fully off one edge before it re-enters. */
const wrapX = (x: number, span: number, width: number): number => {
  const period = width + span;
  return ((x % period) + period) % period - span;
};

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
        const img = pieces[p.variant];
        const x = Math.round(wrapX(p.x - drift * parallax, span, width));
        drawPiece(ctx, img, x, p.y, p.flip, rows ?? img.height);
      }
    },
  };
};

export { ridgeLayer, wrapX };
