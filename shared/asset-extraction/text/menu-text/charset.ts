/* @layer shared-asset-extraction @kind logic */
/**
 * The 160-entry character set the end-sequence text indexes into.
 *
 * The ending renderer never stores characters. Every text byte is an index into
 * a 160-word tile table in ROM (`kEnding_MapData`, SNES 0x8EB038), so that table
 * is what fixes the alphabet:
 *
 *   0..25     small 8x8 A-Z, first palette
 *   26..51    the same 26 glyphs, second palette
 *   52..55    small punctuation: comma, apostrophe, hyphen, period
 *   56..81    the same 26 glyphs, third palette
 *   82        small mid-height dot (the one used for an ellipsis)
 *   83..92    large 8x16 digits 0-9, upper half
 *   93..118   large 8x16 A-Z, upper half
 *   119, 120  large apostrophe and exclamation mark, upper half
 *   121..158  the lower halves of 83..120, same order (index + 38)
 *   159       blank
 *
 * A large character therefore costs two entries and occupies two tile rows: the
 * upper halves on one row, the lower halves on the next. Both decoders collapse
 * such a pair back into one logical line.
 *
 * The five punctuation glyphs carry no name in ROM, so they were identified by
 * drawing the tiles they point at (0xe5, 0xf5, 0xf3, 0xf4 and 0xd6 of the 8x8
 * font sheet) and matching the shapes against the dialogue font's own comma,
 * apostrophe, hyphen and period.
 */

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const DIGITS = '0123456789';

/** Where each of the three small-font palettes starts its A-Z run. */
const SMALL_ALPHABET_STARTS = [0, 26, 56];

/** Index of the first large-font upper half, and of the digits inside that run. */
const LARGE_TOP_FIRST = 83;
const LARGE_LETTER_FIRST = 93;
const LARGE_APOSTROPHE = 119;
const LARGE_EXCLAMATION = 120;

/** A lower half sits this far after its upper half. */
const LARGE_BOTTOM_OFFSET = 38;
const LARGE_TOP_LAST = LARGE_EXCLAMATION;
const LARGE_BOTTOM_FIRST = LARGE_TOP_FIRST + LARGE_BOTTOM_OFFSET;
const LARGE_BOTTOM_LAST = LARGE_TOP_LAST + LARGE_BOTTOM_OFFSET;

/** The one entry that draws nothing. */
const BLANK_INDEX = 159;
const CHARSET_SIZE = 160;

/** Small-font punctuation, keyed by charset index. */
const SMALL_PUNCTUATION: Record<number, string> = {
  52: ',',
  53: "'",
  54: '-',
  55: '.',
  82: '.',
};

const buildCharset = (): string[] => {
  const set = new Array<string>(CHARSET_SIZE).fill(' ');

  for (const start of SMALL_ALPHABET_STARTS) {
    for (let i = 0; i < LETTERS.length; i++) set[start + i] = LETTERS[i];
  }
  for (const [index, glyph] of Object.entries(SMALL_PUNCTUATION)) set[Number(index)] = glyph;

  for (let i = 0; i < DIGITS.length; i++) set[LARGE_TOP_FIRST + i] = DIGITS[i];
  for (let i = 0; i < LETTERS.length; i++) set[LARGE_LETTER_FIRST + i] = LETTERS[i];
  set[LARGE_APOSTROPHE] = "'";
  set[LARGE_EXCLAMATION] = '!';

  for (let i = LARGE_TOP_FIRST; i <= LARGE_TOP_LAST; i++) set[i + LARGE_BOTTOM_OFFSET] = set[i];

  set[BLANK_INDEX] = ' ';
  return set;
};

/** The full table, one readable character per charset index. */
const kEndingCharset: readonly string[] = buildCharset();

const endingCharAt = (index: number): string => kEndingCharset[index] ?? ' ';

/** True for the upper half of a large 8x16 character. */
const isLargeTop = (index: number): boolean => index >= LARGE_TOP_FIRST && index <= LARGE_TOP_LAST;

/** True for the lower half of a large 8x16 character. */
const isLargeBottom = (index: number): boolean =>
  index >= LARGE_BOTTOM_FIRST && index <= LARGE_BOTTOM_LAST;

const isBlank = (index: number): boolean => index === BLANK_INDEX;

export { BLANK_INDEX, CHARSET_SIZE, endingCharAt, isBlank, isLargeBottom, isLargeTop, kEndingCharset };
