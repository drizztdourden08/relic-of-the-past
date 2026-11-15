/* @layer shared-asset-extraction @kind logic */
import { LETTER_PROBE, LETTER_RATIO, MAX_GLYPH_WIDTH, WIDTH_SIMILARITY } from './font.constants';
import type { FontWidthsFound, FontWidthsSearch } from './font.type';

const plausibleWidths = (widths: Uint8Array): boolean => {
  if (widths.some((width) => width > MAX_GLYPH_WIDTH)) return false;
  const letters = widths.subarray(0, LETTER_PROBE);
  const drawn = letters.filter((width) => width >= 1).length;
  return letters.length > 0 && drawn / letters.length >= LETTER_RATIO;
};

const closeTo = (patched: Uint8Array, at: number, reference: Uint8Array): boolean => {
  const allowed = Math.floor(reference.length * (1 - WIDTH_SIMILARITY));
  let misses = 0;
  for (let i = 0; i < reference.length; i += 1) {
    if (patched[at + i] !== reference[i]) misses += 1;
    if (misses > allowed) return false;
  }
  return true;
};

const searchMoved = (search: FontWidthsSearch, reference: Uint8Array): Uint8Array | null => {
  for (let at = 0; at + search.count <= search.patched.length; at += 1) {
    if (!closeTo(search.patched, at, reference)) continue;
    const widths = search.patched.slice(at, at + search.count);
    if (plausibleWidths(widths)) return widths;
  }
  return null;
};

const locateFontWidths = (search: FontWidthsSearch): FontWidthsFound | null => {
  const atBase = search.patched.slice(search.at, search.at + search.count);
  const { reference } = search;
  if (!reference) return plausibleWidths(atBase) ? { widths: atBase, source: 'unchecked' } : null;
  if (plausibleWidths(atBase) && closeTo(search.patched, search.at, reference)) return { widths: atBase, source: 'base' };
  const moved = searchMoved(search, reference);
  if (moved) return { widths: moved, source: 'moved' };
  if (plausibleWidths(atBase)) return { widths: atBase, source: 'unchecked' };
  return { widths: reference.slice(0, search.count), source: 'release' };
};

export { locateFontWidths, plausibleWidths };
