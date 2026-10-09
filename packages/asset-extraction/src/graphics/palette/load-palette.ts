/* @layer shared-asset-extraction @kind logic */
import { TRANSPARENT } from './palette.constants';
import type { RGBA } from './palette.type';
import { snesToRgba } from './snes-to-rgba';

const loadPalette = (words: number[], transparentIndex = 0): RGBA[] => {
  return words.map((w, i) =>
    i === transparentIndex ? TRANSPARENT : snesToRgba(w)
  );
};

export { loadPalette };
