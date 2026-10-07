/* @layer renderer-hud @kind component */
/**
 * One row of the game's own glyphs, drawn from a glyph atlas into a canvas. Each cell is copied
 * from the atlas at its pen x, so the row lays out exactly as the engine's bitmap did. A highlighted
 * cell is copied from its highlight's atlas instead, when one is given. The backing store is sized
 * in device pixels and smoothing is off, so the face stays a pixel face.
 */
import { useLayoutEffect, useRef } from 'react';
import type { DialogCell } from '@shared/game/dialog/dialog-frame.types';

/** Atlas geometry: 16 glyphs per row, 8 by 16 cells. */
const ATLAS_COLUMNS = 16;
const CELL_W = 8;
const CELL_H = 16;

const NO_HIGHLIGHTS: readonly (HTMLCanvasElement | null)[] = [];

interface GlyphRowProps {
  cells: DialogCell[];
  atlas: HTMLCanvasElement;
  /** The primary then the secondary highlight's atlas; a missing one draws from |atlas|. */
  highlightAtlases?: readonly (HTMLCanvasElement | null)[];
  /** CSS pixels per game pixel, magnification included. */
  unit: number;
  /** Row width in game pixels. */
  widthPx: number;
}

const sourceOf = (cell: DialogCell, atlas: HTMLCanvasElement, highlights: readonly (HTMLCanvasElement | null)[]): HTMLCanvasElement =>
  (cell.highlight ? highlights[cell.highlight - 1] ?? atlas : atlas);

const paintRow = (canvas: HTMLCanvasElement, props: GlyphRowProps): void => {
  const { cells, atlas, highlightAtlases = NO_HIGHLIGHTS, unit, widthPx } = props;
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
  for (const cell of cells) {
    const { glyph, x, w } = cell;
    const sx = (glyph % ATLAS_COLUMNS) * CELL_W;
    const sy = Math.floor(glyph / ATLAS_COLUMNS) * CELL_H;
    const source = sourceOf(cell, atlas, highlightAtlases);
    ctx.drawImage(source, sx, sy, w, CELL_H, Math.round(x * px), 0, Math.round(w * px), Math.round(CELL_H * px));
  }
};

const GlyphRow = (props: GlyphRowProps) => {
  const { cells, atlas, highlightAtlases, unit, widthPx } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    if (canvasRef.current) paintRow(canvasRef.current, { cells, atlas, highlightAtlases, unit, widthPx });
  }, [cells, atlas, highlightAtlases, unit, widthPx]);

  return (
    <canvas
      ref={canvasRef}
      style={{ display: 'block', width: widthPx * unit, height: CELL_H * unit, imageRendering: 'pixelated' }}
    />
  );
};

export { GlyphRow };
export type { GlyphRowProps };
