/* @layer shared-asset-extraction @kind logic */
import type { RomData } from '../../rom/rom-types';
import type { DecodedLine } from './menu-text.type';
import { advanceAddress } from '../../rom/snes-address';
import { kLanguages } from '../data/language-data';
import {
  CONTROL_FIXED_SOURCE, CONTROL_LENGTH_MASK, EXTRA_GLYPHS, FONT_TILE_COUNT, LOWER_HALF_BIT, MAX_SLUG, MENU_TILEMAPS,
  SPACE_TILE, STRIPE_END, TILE_INDEX_MASK,
} from './decode-stripe-text.constants';

const codeFromTile = (tile: number): number => ((tile & 0xe0) >> 1) | (tile & 0x0f);

const readStripe = (rom: RomData, address: number): number[][] => {
  const runs: number[][] = [];
  let ea = address;
  const next = (): number => {
    const value = rom.getByte(ea);
    ea = advanceAddress(ea);
    return value;
  };

  while ((rom.getByte(ea) & STRIPE_END) === 0) {
    next();
    next();
    const controlHi = next();
    const controlLo = next();
    const control = (controlHi << 8) | controlLo;
    const byteLength = (control & CONTROL_LENGTH_MASK) + 1;

    if ((control & CONTROL_FIXED_SOURCE) !== 0) {
      next();
      next();
      continue;
    }

    const words: number[] = [];
    for (let i = 0; i + 1 < byteLength; i += 2) {
      const lo = next();
      const hi = next();
      words.push(lo | (hi << 8));
    }
    if ((byteLength & 1) !== 0) next();
    runs.push(words);
  }

  return runs;
};

const tileOf = (word: number): number => word & TILE_INDEX_MASK;

const isGlyphRun = (words: number[]): boolean =>
  words.length > 0 && words.every((word) => tileOf(word) < FONT_TILE_COUNT);

const isLowerHalfRun = (words: number[]): boolean => {
  let sawLowerHalf = false;
  for (const word of words) {
    const tile = tileOf(word);
    if (tile === SPACE_TILE) continue;
    if ((tile & LOWER_HALF_BIT) === 0) return false;
    sawLowerHalf = true;
  }
  return sawLowerHalf;
};

const runToText = (words: number[], alphabet: readonly string[]): string => {
  let text = '';
  for (const word of words) {
    const tile = tileOf(word);
    const upperHalf = (tile & LOWER_HALF_BIT) !== 0 ? tile - LOWER_HALF_BIT : tile;
    const code = codeFromTile(upperHalf);
    text += alphabet[code] ?? EXTRA_GLYPHS[code] ?? '?';
  }
  return text;
};

const slugify = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, MAX_SLUG)
    .replace(/-+$/, '');

const decodeMenuText = (rom: RomData, langCode: string): DecodedLine[] => {
  const language = kLanguages[langCode];
  if (!language) throw new Error(`Unknown language code: ${langCode}`);

  const lines: DecodedLine[] = [];
  const slugCounts = new Map<string, number>();

  for (const address of MENU_TILEMAPS) {
    for (const words of readStripe(rom, address)) {
      if (!isGlyphRun(words) || isLowerHalfRun(words)) continue;
      const text = runToText(words, language.alphabet);
      const slug = slugify(text);
      if (!slug) continue;

      const seen = (slugCounts.get(slug) ?? 0) + 1;
      slugCounts.set(slug, seen);
      lines.push({
        key: `menu.${seen === 1 ? slug : `${slug}-${seen}`}`,
        text,
        limit: { kind: 'tiles', max: words.length },
      });
    }
  }

  return lines;
};

export { decodeMenuText };
