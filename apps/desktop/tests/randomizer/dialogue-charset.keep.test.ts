/* @layer tests @kind test */
import { describe, expect, it } from 'vitest';
import { compressStrings, kLanguages, kFontTypes } from '@rotp/asset-extraction';
import { GLYPH_SLOTS, alphabetChars, dialogueCharsetOf, displayAlphabetOf, extraGlyphSlots, extraSlotOfToken, readableText, EXTRA_GLYPHS, extraGlyphTiles } from '@rotp/game-data';
import { primary, secondary } from '@rotp/randomizer';
import { stripHighlight, toDialogueText, compressMarkedStrings } from '@rotp/game-core';
import type { DialogueCharset } from '@rotp/game-data';
import { required } from '../required';
import { ICE_TRAP_NAME } from './dialogue-charset.fixture';

type Glyph = (typeof EXTRA_GLYPHS)[number];

const REQUIRED = "_-.,'()!?&+/:#%*\";=<>[]~@^`";
const PRINTABLE_ASCII = Array.from({ length: 95 }, (_, i) => String.fromCharCode(32 + i)).join('');
const SAMPLES = ['Drizztdourden_', 'Bottle (Fairy)', "Kokiri's Emerald", 'Buy Deku Stick (1)', 'Rupees (100)', ICE_TRAP_NAME, 'A&B'];
const NEIGHBOURS: readonly (readonly [number, number])[] = [[-1, 0], [1, 0], [0, -1], [0, 1]];

const alphabetOf = (code: string): string[] => required(kLanguages[code], `language ${code}`).alphabet;
const widthCountOf = (code: string): number => required(kFontTypes[code], `font ${code}`).widthCount;

const charsetOf = (code: string): DialogueCharset => {
  const alphabet = alphabetOf(code);
  const widths = new Uint8Array(widthCountOf(code)).fill(6);
  return dialogueCharsetOf(alphabet, widths, extraGlyphSlots(alphabet, widths.length));
};

const cellAt = (glyph: Glyph, x: number, y: number): string => glyph.rows[y]?.[x] ?? ' ';

const expectEdgeAround = (glyph: Glyph, x: number, y: number): void => {
  for (const [dx, dy] of NEIGHBOURS) {
    const nx = x + dx;
    const ny = y + dy;
    if (nx < 0 || ny < 0 || nx >= glyph.width || ny >= 16) continue;
    expect(cellAt(glyph, nx, ny), `${glyph.char} ${nx},${ny}`).not.toBe(' ');
  }
};

const expectGlyphRow = (glyph: Glyph, y: number): void => {
  expect(glyph.rows[y], `${glyph.char} row ${y}`).toMatch(/^[ .#]{8}$/);
  for (let x = glyph.width; x < 8; x++) expect(cellAt(glyph, x, y), `${glyph.char} ${x},${y}`).toBe(' ');
  for (let x = 0; x < 8; x++) {
    if (cellAt(glyph, x, y) === '#') expectEdgeAround(glyph, x, y);
  }
};

const codesOf = (text: string, charset: DialogueCharset): number[] =>
  [...text].map((ch) => extraSlotOfToken(ch) ?? charset.alphabet.indexOf(ch));

const LANGUAGES = ['us', 'de', 'fr', 'fr-c'];
const EU_FALLBACKS: Readonly<Record<string, string>> = { '{': '(', '}': ')', '\\': '/', '|': '?', $: '?' };

describe('coverage of the native box', () => {
  it('draws every required character with a real glyph in the US and European fonts', () => {
    for (const code of LANGUAGES) {
      const charset = charsetOf(code);
      for (const ch of REQUIRED) {
        const drawn = toDialogueText(`a${ch}a`, charset);
        expect(readableText(drawn, charset), `${code} ${ch}`).toBe(`a${ch}a`);
        for (const glyph of codesOf(drawn, charset)) expect(glyph, `${code} ${ch}`).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('draws all of printable ASCII in the US font, and falls back only for the documented five in Europe', () => {
    const us = charsetOf('us');
    expect(readableText(toDialogueText(`a${PRINTABLE_ASCII}a`, us), us)).toBe(`a${PRINTABLE_ASCII}a`);
    const de = charsetOf('de');
    for (const ch of PRINTABLE_ASCII) {
      const read = readableText(toDialogueText(`a${ch}a`, de), de);
      expect(read, ch).toBe(ch === ' ' ? 'a a' : `a${EU_FALLBACKS[ch] ?? ch}a`);
    }
  });

  it('lays the extra glyphs into spare slots only, past the alphabet and the width table', () => {
    for (const code of LANGUAGES) {
      const alphabet = alphabetOf(code);
      const slots = extraGlyphSlots(alphabet, widthCountOf(code));
      const first = Math.max(alphabet.length, widthCountOf(code));
      expect(slots.map((slot) => slot.slot)).toEqual(slots.map((_, i) => first + i));
      expect(slots.every((slot) => slot.slot < GLYPH_SLOTS && !alphabetChars(alphabet).has(slot.char))).toBe(true);
    }
    expect(extraGlyphSlots(alphabetOf('us'), 99)).toHaveLength(21);
    expect(extraGlyphSlots(alphabetOf('de'), 112)).toHaveLength(16);
  });

  it('knows the width of every glyph code a line can reach', () => {
    for (const code of LANGUAGES) {
      const charset = charsetOf(code);
      expect(charset.widths).toHaveLength(GLYPH_SLOTS);
      for (const glyph of codesOf(toDialogueText(PRINTABLE_ASCII, charset), charset)) {
        expect(charset.widths[glyph], `${code} glyph ${glyph}`).toBeGreaterThan(0);
        expect(charset.widths[glyph]).toBeLessThanOrEqual(8);
      }
    }
  });
});

describe('names and items keep their characters', () => {
  it('round-trips every sample unchanged and encodes it in both text encodings', () => {
    for (const code of ['us', 'de']) {
      const charset = charsetOf(code);
      for (const sample of SAMPLES) {
        const drawn = toDialogueText(`${secondary(sample)} ${primary(sample)}`, charset);
        expect(readableText(stripHighlight(drawn), charset)).toBe(`${sample} ${sample}`);
        expect(() => compressMarkedStrings([drawn], code)).not.toThrow();
      }
    }
  });

  it('writes an extra glyph as its escape: 0x83 then the slot in US, 0x87 then the slot in Europe', () => {
    const us = charsetOf('us');
    const underscore = us.extras.find((extra) => extra.char === '_')?.slot ?? -1;
    const bytes = required(compressMarkedStrings([toDialogueText('Zelda_', us)], 'us')[0], 'US bytes');
    const usZelda = required(compressStrings(['Zelda'], 'us')[0], 'US Zelda bytes');
    expect([...bytes]).toEqual([...usZelda, 0x83, underscore]);
    const de = charsetOf('de');
    const slot = de.extras.find((extra) => extra.char === '_')?.slot ?? -1;
    expect(slot).toBeGreaterThanOrEqual(0x60);
    const euBytes = required(compressMarkedStrings([toDialogueText('Zelda_', de)], 'de')[0], 'German bytes');
    const euZelda = required(compressStrings(['Zelda'], 'de')[0], 'German Zelda bytes');
    expect([...euBytes]).toEqual([...euZelda, 0x87, slot]);
  });

  it('shows the extra glyphs as their own characters in the modern face', () => {
    const us = charsetOf('us');
    const display = displayAlphabetOf(alphabetOf('us'), us.extras);
    for (const extra of us.extras) expect(display[extra.slot]).toBe(extra.char);
  });
});

describe('fallbacks', () => {
  const us = charsetOf('us');
  const read = (text: string, charset = us): string => readableText(toDialogueText(text, charset), charset);

  it('drops accents to the base letter where the font has no accented glyph', () => {
    expect(read('Pokémon Café Ångström')).toBe('Pokemon Cafe Angstrom');
    expect(read('Straße Æsir Łódź')).toBe('Strasse AEsir Lodz');
    expect(read('Pokémon', charsetOf('fr'))).toBe('Pokémon');
  });

  it('writes typographic forms plainly', () => {
    const dash = String.fromCodePoint(0x2014);
    const quotes = `${String.fromCodePoint(0x201c)}Hi${String.fromCodePoint(0x201d)} ${String.fromCodePoint(0x2019)}s`;
    expect(read(`A${dash}B ${quotes}${String.fromCodePoint(0x2026)}`)).toBe('A-B "Hi" \'s...');
    expect(read('ＡＢ_＿')).toBe('AB__');
  });

  it('turns any other script or an emoji into a question mark, and drops joiners', () => {
    expect(read('日本 Link')).toBe('?? Link');
    expect(read('\u{1F600}!')).toBe('?!');
    expect(read('\u{1F468}‍\u{1F469}')).toBe('??');
  });
});

describe('the extra glyphs are drawn as the font draws its own', () => {
  it('fits every glyph in its cell and its width, with the edge ringing the body', () => {
    for (const glyph of EXTRA_GLYPHS) {
      expect(glyph.rows, glyph.char).toHaveLength(16);
      expect(glyph.width).toBeGreaterThan(0);
      expect(glyph.width).toBeLessThanOrEqual(8);
      for (let y = 0; y < 16; y++) expectGlyphRow(glyph, y);
    }
  });

  it('packs the rows as two 2bpp tiles, top then bottom', () => {
    const underscore = required(EXTRA_GLYPHS.find((glyph) => glyph.char === '_'), 'underscore glyph');
    const tiles = extraGlyphTiles(underscore);
    expect(tiles).toHaveLength(32);
    const bottomTileRow5 = 16 + 5 * 2;
    const bodyPlane = bottomTileRow5 + 1;
    const edgePlane = bottomTileRow5;
    expect(tiles[bodyPlane]).toBe(0b01111000);
    expect(tiles[edgePlane]).toBe(0b10000100);
    expect([...tiles.subarray(0, 16)].every((byte) => byte === 0)).toBe(true);
  });
});
