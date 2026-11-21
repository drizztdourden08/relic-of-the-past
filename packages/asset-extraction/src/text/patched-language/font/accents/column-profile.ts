/* @layer shared-asset-extraction @kind logic */
import type { Shape } from './accents.type';

const columnProfile = (shape: Shape): number[] =>
  Array.from({ length: shape.width }, (_, col) => {
    const rows = shape.cells.flatMap((row, index) => ((row[col] ?? 0) !== 0 ? [index] : []));
    return rows.length === 0 ? -1 : rows.reduce((total, row) => total + row, 0) / rows.length;
  }).filter((row) => row >= 0);

export { columnProfile };
