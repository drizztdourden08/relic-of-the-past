/* @layer shared-asset-extraction @kind logic */
import type { FontReference } from '../font.type';
import { glyphPixelGrid } from '../glyph-pixel-grid';
import { BASE_SHIFTS } from './accents.constants';
import type { LearnedMark, MarkCut, PixelGrid } from './accents.type';
import { cutMark } from './cut-mark';
import { markSplit } from './mark-split';

const firstCut = (glyph: PixelGrid, base: PixelGrid): MarkCut | null => {
  for (const shift of BASE_SHIFTS) {
    const cut = cutMark({ glyph, base, shift });
    if (cut) return cut;
  }
  return null;
};

const learnFrom = (reference: FontReference): LearnedMark[] => {
  const marks: LearnedMark[] = [];
  for (const [glyph, token] of reference.alphabet.entries()) {
    const split = markSplit(token);
    const home = split ? reference.alphabet.indexOf(split.letter) : -1;
    if (!split || home < 0) continue;
    const cut = firstCut(glyphPixelGrid(reference.tiles, glyph), glyphPixelGrid(reference.tiles, home));
    if (cut) marks.push({ mark: split.mark, shape: cut.shape, zone: cut.zone, release: reference.release });
  }
  return marks;
};

const learnMarks = (references: readonly FontReference[]): LearnedMark[] => references.flatMap(learnFrom);

export { learnMarks };
