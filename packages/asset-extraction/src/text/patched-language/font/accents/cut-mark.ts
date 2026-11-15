/* @layer shared-asset-extraction @kind logic */
import { MAX_MARK_ROWS, MAX_REMOVED } from './accents.constants';
import type { CutInput, MarkCut, PixelGrid, Shape } from './accents.type';
import { cellAt } from './cell-at';
import { cropShape, inkRows } from './crop-shape';
import { shiftedGrid } from './shifted-grid';

const differingRows = (glyph: PixelGrid, base: PixelGrid): number =>
  glyph.filter((row, index) => row.some((cell, col) => cell !== cellAt(base, index, col))).length;

const removedCells = (glyph: PixelGrid, base: PixelGrid): number =>
  base.reduce((total, row, index) =>
    total + row.filter((cell, col) => cell !== 0 && cellAt(glyph, index, col) === 0).length, 0);

const matchedCells = (glyph: PixelGrid, base: PixelGrid): number =>
  glyph.reduce((total, row, index) =>
    total + row.filter((cell, col) => cell !== 0 && cellAt(base, index, col) !== 0).length, 0);

const insideCells = (added: PixelGrid, ink: readonly number[]): number => {
  const first = ink[0] ?? 0;
  const last = ink[ink.length - 1] ?? 0;
  return added.reduce((total, row, index) =>
    total + (index >= first && index <= last ? row.filter((cell) => cell !== 0).length : 0), 0);
};

const addedGrid = (glyph: PixelGrid, base: PixelGrid): number[][] =>
  glyph.map((row, index) => row.map((cell, col) => (cell !== 0 && cellAt(base, index, col) === 0 ? 1 : 0)));

const markZone = (shape: Shape, ink: readonly number[]): MarkCut['zone'] => {
  const first = ink[0] ?? 0;
  const last = ink[ink.length - 1] ?? 0;
  return shape.top + shape.height / 2 < (first + last + 1) / 2 ? 'above' : 'below';
};

const isClear = (shape: Shape, ink: readonly number[]): boolean =>
  !ink.some((row) => row >= shape.top && row < shape.top + shape.height);

const cutMark = (input: CutInput): MarkCut | null => {
  const base = shiftedGrid(input.base, input.shift, input.column);
  const rows = differingRows(input.glyph, base);
  const removed = removedCells(input.glyph, base);
  if (rows === 0 || rows > MAX_MARK_ROWS || removed > MAX_REMOVED) return null;
  const added = addedGrid(input.glyph, base);
  const shape = cropShape(added);
  if (shape === null) return null;
  const ink = inkRows(base);
  if (ink.length === 0) return null;
  return {
    shape,
    zone: markZone(shape, ink),
    clear: isClear(shape, ink),
    removed,
    inside: insideCells(added, ink),
    matched: matchedCells(input.glyph, base),
  };
};

export { cutMark };
