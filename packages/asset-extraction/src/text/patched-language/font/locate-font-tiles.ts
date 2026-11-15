/* @layer shared-asset-extraction @kind logic */
import { FONT_TILE_BYTES } from '../../data/font-data';
import { FONT_MATCH_RATIO, PROBE_GLYPHS, TILE_BYTES } from './font.constants';
import type { FontReference, FontTilesFound, FontTilesSearch } from './font.type';
import { glyphBytes, glyphTopOffset, isBlankGlyph } from './glyph-bytes';
import { fontMatchRatio } from './font-match-ratio';
import { byBaseFirst, referenceKeys } from './reference-keys';

const tilesAt = (patched: Uint8Array, at: number): Uint8Array => patched.slice(at, at + FONT_TILE_BYTES);

const probeGlyphs = (reference: FontReference, glyphLimit: number): number[] => {
  const glyphs: number[] = [];
  for (let glyph = 0; glyph < glyphLimit && glyphs.length < PROBE_GLYPHS; glyph += 1) {
    if (!isBlankGlyph(reference.tiles, glyph)) glyphs.push(glyph);
  }
  return glyphs;
};

const occurrences = (patched: Uint8Array, needle: Uint8Array): number[] => {
  const hay = Buffer.from(patched.buffer, patched.byteOffset, patched.byteLength);
  const found: number[] = [];
  for (let at = hay.indexOf(needle); at >= 0; at = hay.indexOf(needle, at + 1)) found.push(at);
  return found;
};

const searchMoved = (search: FontTilesSearch, keys: ReadonlyMap<string, string>): number | null => {
  const tried = new Set<number>([search.at]);
  for (const reference of byBaseFirst(search.references)) {
    for (const glyph of probeGlyphs(reference, search.glyphLimit)) {
      const top = glyphBytes(reference.tiles, glyph).subarray(0, TILE_BYTES);
      for (const hit of occurrences(search.patched, top)) {
        const start = hit - glyphTopOffset(glyph);
        if (start < 0 || start + FONT_TILE_BYTES > search.patched.length || tried.has(start)) continue;
        tried.add(start);
        if (fontMatchRatio(tilesAt(search.patched, start), keys, search.glyphLimit) >= FONT_MATCH_RATIO) return start;
      }
    }
  }
  return null;
};

const locateFontTiles = (search: FontTilesSearch): FontTilesFound => {
  const atBase = { tiles: tilesAt(search.patched, search.at), at: search.at, moved: false };
  const keys = referenceKeys(search.references, search.glyphLimit);
  if (keys.size === 0) return { ...atBase, checked: false };
  if (fontMatchRatio(atBase.tiles, keys, search.glyphLimit) >= FONT_MATCH_RATIO) return { ...atBase, checked: true };
  const moved = searchMoved(search, keys);
  if (moved === null) return { ...atBase, checked: false };
  return { tiles: tilesAt(search.patched, moved), at: moved, moved: true, checked: true };
};

export { locateFontTiles };
