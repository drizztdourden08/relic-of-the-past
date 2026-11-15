/* @layer shared-asset-extraction @kind logic */
import { FONT_TILE_BYTES } from '../../data/font-data';
import { FONT_MATCH_RATIO, PROBE_GLYPHS, TILE_BYTES } from './font.constants';
import type { FontReference, FontTilesFound, FontTilesSearch, TileHunt } from './font.type';
import { byBaseFirst } from './by-base-first';
import { fontMatchRatio } from './font-match-ratio';
import { glyphBytes } from './glyph-bytes';
import { glyphTopOffset } from './glyph-top-offset';
import { isBlankGlyph } from './is-blank-glyph';
import { referenceKeys } from './reference-keys';

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

const matchedStart = (hunt: TileHunt, glyph: number, hit: number): number | null => {
  const { search, keys, tried } = hunt;
  const start = hit - glyphTopOffset(glyph);
  if (start < 0 || start + FONT_TILE_BYTES > search.patched.length || tried.has(start)) return null;
  tried.add(start);
  return fontMatchRatio(tilesAt(search.patched, start), keys, search.glyphLimit) >= FONT_MATCH_RATIO ? start : null;
};

const searchGlyph = (hunt: TileHunt, reference: FontReference, glyph: number): number | null => {
  const top = glyphBytes(reference.tiles, glyph).subarray(0, TILE_BYTES);
  for (const hit of occurrences(hunt.search.patched, top)) {
    const start = matchedStart(hunt, glyph, hit);
    if (start !== null) return start;
  }
  return null;
};

const searchMoved = (search: FontTilesSearch, keys: ReadonlyMap<string, string>): number | null => {
  const hunt: TileHunt = { search, keys, tried: new Set<number>([search.at]) };
  for (const reference of byBaseFirst(search.references)) {
    for (const glyph of probeGlyphs(reference, search.glyphLimit)) {
      const start = searchGlyph(hunt, reference, glyph);
      if (start !== null) return start;
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
