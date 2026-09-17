/* @layer renderer-hud @kind component */
/**
 * One row of the game's own glyphs, drawn from a glyph atlas into a canvas. Each cell is copied
 * from the atlas at its pen x, so the row lays out exactly as the engine's bitmap did. The backing
 * store is sized in device pixels and smoothing is off, so the face stays a pixel face.
 */
import { useLayoutEffect, useRef } from 'react';
import type { DialogCell } from '@shared/game/dialog/dialog-frame.types';

/** Atlas geometry: 16 glyphs per row, 8 by 16 cells. */
const ATLAS_COLUMNS = 16;
const CELL_W = 8;
const CELL_H = 16;

interface GlyphRowProps {
  cells: DialogCell[];
  atlas: HTMLCanvasElement;
  /** CSS pixels per game pixel, magnification included. */
  unit: number;
  /** Row width in game pixels. */
  widthPx: number;
}

const paintRow = (canvas: HTMLCanvasElement, cells: DialogCell[], atlas: HTMLCanvasElement, unit: number, widthPx: number): void => {
  const ratio = window.devicePixelRatio || 1;
  const width = Math.max(1, Math.round(widthPx * unit * ratio));
  const height = Math.max(1, Math.round(CELL_H * unit * ratio));
  if (canvas.width !== width) canvas.width = width;
  if (canvas.height !== height) canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, width, height);
  const px = unit * ratio;
  for (const { glyph, x, w } of cells) {
    const sx = (glyph % ATLAS_COLUMNS) * CELL_W;
    const sy = Math.floor(glyph / ATLAS_COLUMNS) * CELL_H;
    ctx.drawImage(atlas, sx, sy, w, CELL_H, Math.round(x * px), 0, Math.round(w * px), Math.round(CELL_H * px));
  }
};

const GlyphRow = (props: GlyphRowProps) => {
  const { cells, atlas, unit, widthPx } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    if (canvasRef.current) paintRow(canvasRef.current, cells, atlas, unit, widthPx);
  }, [cells, atlas, unit, widthPx]);

  return (
    <canvas
      ref={canvasRef}
      style={{ display: 'block', width: widthPx * unit, height: CELL_H * unit, imageRendering: 'pixelated' }}
    />
  );
};

export { GlyphRow };
export type { GlyphRowProps };
