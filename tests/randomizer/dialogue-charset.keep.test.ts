/* @layer tests @kind test */
/**
 * What a composed line can draw in the game's own message box. Every character an Archipelago
 * name can hold either encodes to a real glyph (one of the language's own, or an extra glyph
 * written into a spare slot of its font) or to a documented fallback: an accented letter to its
 * base letter, a bracket to a parenthesis when no slot is left, anything else to a question mark.
 * Every glyph code a line can reach has a known width, the extra glyphs are drawn the way the
 * font draws its own, and a name keeps every character it was typed with.
 */
import { describe, expect, it } from 'vitest';
import { compressStrings } from '@shared/asset-extraction/text/dialogue-encoder';
import { kLanguages } from '@shared/asset-extraction/text/data/language-data';
import { kFontTypes } from '@shared/asset-extraction/text/data/font-data';
import {
  GLYPH_SLOTS, alphabetChars, dialogueCharsetOf, displayAlphabetOf, extraGlyphSlots, extraSlotOfToken, readableText,
} from '@shared/game/dialog/dialogue-charset';
import { EXTRA_GLYPHS } from '@shared/game/dialog/extra-glyphs.data';
import { extraGlyphTiles } from '@shared/game/dialog/extra-glyph-tiles';
import { primary, secondary, stripHighlight } from '@shared/randomizer/receipt-text/highlight-markup';
import { toDialogueText } from '@app/lib/game/session-dialogue/dialogue-text';
import { compressMarkedStrings } from '@app/lib/game/session-dialogue/highlight-bytes';
import type { DialogueCharset } from '@shared/game/dialog/dialogue-charset';

/** The characters the request named, as they turn up in slot, item and location names. */
const REQUIRED = "_-.,'()!?&+/:#%*\";=<>[]~@^`";
const PRINTABLE_ASCII = Array.from({ length: 95 }, (_, i) => String.fromCharCode(32 + i)).join('');
const SAMPLES = ['Drizztdourden_', 'Bottle (Fairy)', "Kokiri's Emerald", 'Buy Deku Stick (1)', 'Rupees (100)', 'Ice Trap!', 'A&B'];

/** A charset as the session builds it, with a stand-in width of 6 for every baked glyph. */
const charsetOf = (code: string): DialogueCharset => {
  const { alphabet } = kLanguages[code];
  const widths = new Uint8Array(kFontTypes[code].widthCount).fill(6);
  return dialogueCharsetOf(alphabet, widths, extraGlyphSlots(alphabet, widths.length));
};

/** The glyph code each character of drawable |text| reaches. */
const codesOf = (text: string, charset: DialogueCharset): number[] =>
  [...text].map((ch) => extraSlotOfToken(ch) ?? charset.alphabet.indexOf(ch));

const LANGUAGES = ['us', 'de', 'fr', 'fr-c'];
/** European fonts have 16 spare slots for the 21 characters they lack; these five fall back. */
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
      const { alphabet } = kLanguages[code];
      const slots = extraGlyphSlots(alphabet, kFontTypes[code].widthCount);
      const first = Math.max(alphabet.length, kFontTypes[code].widthCount);
      expect(slots.map((slot) => slot.slot)).toEqual(slots.map((_, i) => first + i));
      expect(slots.every((slot) => slot.slot < GLYPH_SLOTS && !alphabetChars(alphabet).has(slot.char))).toBe(true);
    }
    expect(extraGlyphSlots(kLanguages.us.alphabet, 99)).toHaveLength(21);
    expect(extraGlyphSlots(kLanguages.de.alphabet, 112)).toHaveLength(16);
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
    const [bytes] = compressMarkedStrings([toDialogueText('Zelda_', us)], 'us');
    expect([...bytes]).toEqual([...compressStrings(['Zelda'], 'us')[0], 0x83, underscore]);
    const de = charsetOf('de');
    const slot = de.extras.find((extra) => extra.char === '_')?.slot ?? -1;
    expect(slot).toBeGreaterThanOrEqual(0x60);
    const [euBytes] = compressMarkedStrings([toDialogueText('Zelda_', de)], 'de');
    expect([...euBytes]).toEqual([...compressStrings(['Zelda'], 'de')[0], 0x87, slot]);
  });

  it('shows the extra glyphs as their own characters in the modern face', () => {
    const us = charsetOf('us');
    const display = displayAlphabetOf(kLanguages.us.alphabet, us.extras);
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
      const at = (x: number, y: number): string => glyph.rows[y]?.[x] ?? ' ';
      for (let y = 0; y < 16; y++) {
        expect(glyph.rows[y], `${glyph.char} row ${y}`).toMatch(/^[ .#]{8}$/);
        for (let x = glyph.width; x < 8; x++) expect(at(x, y), `${glyph.char} ${x},${y}`).toBe(' ');
        for (let x = 0; x < 8; x++) {
          if (at(x, y) !== '#') continue;
          for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx < 0 || ny < 0 || nx >= glyph.width || ny >= 16) continue;
            expect(at(nx, ny), `${glyph.char} ${nx},${ny}`).not.toBe(' ');
          }
        }
      }
    }
  });

  it('packs the rows as two 2bpp tiles, top then bottom', () => {
    const underscore = EXTRA_GLYPHS.find((glyph) => glyph.char === '_');
    const tiles = extraGlyphTiles(underscore!);
    expect(tiles).toHaveLength(32);
    // Row 13 is the bottom tile's row 5: body ####, plane 1, columns 1-4.
    expect(tiles[16 + 5 * 2 + 1]).toBe(0b01111000);
    // Its edge (plane 0) rings the body on columns 0 and 5.
    expect(tiles[16 + 5 * 2]).toBe(0b10000100);
    expect([...tiles.subarray(0, 16)].every((byte) => byte === 0)).toBe(true);
  });
});
