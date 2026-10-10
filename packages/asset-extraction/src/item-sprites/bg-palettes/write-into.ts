/* @layer shared-asset-extraction @kind logic */
import type { RGBA } from '../../graphics/palette';

const writeInto = (row: RGBA[], first: number, colors: RGBA[]): void => {
  for (const [i, color] of colors.entries()) row[first + i] = color;
};

export { writeInto };
