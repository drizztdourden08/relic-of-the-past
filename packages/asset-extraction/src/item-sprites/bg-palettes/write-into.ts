/* @layer shared-asset-extraction @kind logic */
import type { RGBA } from '../../graphics/palette';

const writeInto = (row: RGBA[], first: number, colors: RGBA[]): void => {
  for (let i = 0; i < colors.length; i += 1) row[first + i] = colors[i];
};

export { writeInto };
