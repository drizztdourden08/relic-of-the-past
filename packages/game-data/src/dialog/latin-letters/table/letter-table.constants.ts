/* @layer shared-game @kind constants */
import { EXTRA_GLYPHS } from '../../extra-glyphs.constants';

const SYMBOL_OF = new Map(EXTRA_GLYPHS.map((glyph) => [glyph.char, glyph]));
const DRAWN_SYMBOLS: ReadonlySet<string> = new Set(EXTRA_GLYPHS.map((glyph) => glyph.char));
const LATIN_SCRIPT = /^\p{Script=Latin}$/u;
const LETTER_TOKEN_BASE = 0xe200;
const PAGE = 256;
const US_LETTER_FIRST = 0x84;
const US_LETTER_PAGES = 4;
const EU_PREFIX = 0x87;
const EU_NAME = 0x86;
const EU_LOW_FIRST = 0x53;
const EU_LOW_COUNT = 13;
const EU_HIGH_FIRST = 0x89;
const EU_HIGH_COUNT = 0x100 - EU_HIGH_FIRST;
const US_CAPACITY = US_LETTER_PAGES * PAGE;
const EU_CAPACITY = EU_LOW_COUNT + EU_HIGH_COUNT + PAGE;
const LETTER_ENTRY_BYTES = 34;
const LETTER_TILE_OFFSET = 2;

export {
  DRAWN_SYMBOLS, EU_CAPACITY, EU_HIGH_COUNT, EU_HIGH_FIRST, EU_LOW_COUNT, EU_LOW_FIRST, EU_NAME, EU_PREFIX,
  LATIN_SCRIPT, LETTER_ENTRY_BYTES, LETTER_TILE_OFFSET, LETTER_TOKEN_BASE, PAGE, SYMBOL_OF, US_CAPACITY,
  US_LETTER_FIRST,
};
