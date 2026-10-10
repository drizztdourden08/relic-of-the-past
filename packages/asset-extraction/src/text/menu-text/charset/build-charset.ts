/* @layer shared-asset-extraction @kind logic */
import {
  BLANK_INDEX, CHARSET_SIZE, DIGITS, LARGE_APOSTROPHE, LARGE_BOTTOM_OFFSET, LARGE_EXCLAMATION, LARGE_LETTER_FIRST,
  LARGE_TOP_FIRST, LARGE_TOP_LAST, LETTERS, SMALL_ALPHABET_STARTS, SMALL_PUNCTUATION,
} from './charset.constants';

const buildCharset = (): string[] => {
  const set = new Array<string>(CHARSET_SIZE).fill(' ');

  const place = (first: number, glyphs: Iterable<string>): void => {
    for (const [i, glyph] of [...glyphs].entries()) set[first + i] = glyph;
  };
  for (const start of SMALL_ALPHABET_STARTS) place(start, LETTERS);
  for (const [index, glyph] of Object.entries(SMALL_PUNCTUATION)) set[Number(index)] = glyph;

  place(LARGE_TOP_FIRST, DIGITS);
  place(LARGE_LETTER_FIRST, LETTERS);
  set[LARGE_APOSTROPHE] = "'";
  set[LARGE_EXCLAMATION] = '!';

  place(LARGE_TOP_FIRST + LARGE_BOTTOM_OFFSET, set.slice(LARGE_TOP_FIRST, LARGE_TOP_LAST + 1));

  set[BLANK_INDEX] = ' ';
  return set;
};

export { buildCharset };
