/* @layer shared-asset-extraction @kind logic */
import { DOTTED_LETTERS } from './accents.constants';
import type { PixelGrid } from './accents.type';
import { dotlessGrid } from './dotless-grid';

const baseVariants = (letter: string, grid: PixelGrid): PixelGrid[] => {
  if (!DOTTED_LETTERS.includes(letter.toLowerCase())) return [grid];
  const plain = dotlessGrid(grid);
  return plain ? [grid, plain] : [grid];
};

export { baseVariants };
