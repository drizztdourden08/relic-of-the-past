/* @layer shared-asset-extraction @kind logic */
import { DOTTED_LETTERS, SQUASH_COST } from './accents.constants';
import type { BaseVariant, PixelGrid } from './accents.type';
import { dotlessGrid } from './dotless-grid';
import { squashedGrids } from './squashed-grids';

const drawnVariants = (letter: string, grid: PixelGrid): PixelGrid[] => {
  if (!DOTTED_LETTERS.includes(letter.toLowerCase())) return [grid];
  const plain = dotlessGrid(grid);
  return plain ? [grid, plain] : [grid];
};

const baseVariants = (letter: string, grid: PixelGrid): BaseVariant[] =>
  drawnVariants(letter, grid).flatMap((drawn) => [
    { grid: drawn, cost: 0 },
    ...squashedGrids(drawn).map((squashed) => ({ grid: squashed, cost: SQUASH_COST })),
  ]);

export { baseVariants };
