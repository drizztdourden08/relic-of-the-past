/* @layer shared-asset-extraction @kind logic */
import { snesToRgba } from '../../graphics/palette';
import type { RGBA } from '../../graphics/palette';

const writeColors = (row: RGBA[], at: number, words: readonly number[]): void => {
  for (const [i, word] of words.entries()) row[at + i] = snesToRgba(word);
};

export { writeColors };
