/* @layer shared-asset-extraction @kind logic */
import {
  BLANK_INDEX, CHARSET_SIZE, DIGITS, LARGE_APOSTROPHE, LARGE_BOTTOM_OFFSET, LARGE_EXCLAMATION, LARGE_LETTER_FIRST,
  LARGE_TOP_FIRST, LARGE_TOP_LAST, LETTERS, SMALL_ALPHABET_STARTS, SMALL_PUNCTUATION,
} from './charset.constants';

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

export { buildCharset };
