/* @layer renderer-hud @kind logic */
/**
 * Pure text shaping for the name panel: folds a display string down to the
 * characters the panel can actually draw, then breaks it onto the panel's fixed
 * column grid.
 *
 * GLYPH COVERAGE LIMIT: the panel composes text from one extracted sprite per
 * character, and only A-Z, 0-9, space and '&' have a sprite (see the panel's
 * Glyph). Anything else would draw as an empty gap, so a translated string is
 * folded to that set first: a letter carrying a diacritic degrades to its base
 * ASCII letter, the few letters that do not decompose are mapped by hand, dashes
 * and slashes become spaces (so they still offer a break point), and everything
 * left over is dropped. A name therefore stays legible instead of going blank.
 * Rendering real accented glyphs needs new sprites and a new draw path; that is
 * deliberately out of scope here.
 */

/** '&' is a double-width sprite, so it costs two grid columns (see the panel). */
const AMPERSAND_COLS = 2;

/**
 * The panel's text box: 8 inner columns, and 2 rows reserved for the name.
 * Lines wider than a row are shrunk to fit by the panel itself.
 */
const NAME_PANEL_GRID = { maxCols: 8, maxLines: 2 };

/** Characters that read as a word separator, not a letter. */
const SEPARATORS = new Set(['-', '\u2010', '\u2011', '\u2012', '\u2013', '\u2014', '_', '/', '\\', '·']);

/**
 * Letters with no canonical decomposition, so stripping combining marks alone
 * would drop them. Upper- and lowercase both, since folding happens per char.
 */
const SPECIAL_FOLDS: Record<string, string> = {
  'Æ': 'AE', 'æ': 'AE', 'Œ': 'OE', 'œ': 'OE',
  'Ø': 'O', 'ø': 'O', 'Đ': 'D', 'đ': 'D',
  'Ð': 'D', 'ð': 'D', 'Þ': 'TH', 'þ': 'TH',
  'Ł': 'L', 'ł': 'L', 'Ŋ': 'N', 'ŋ': 'N',
  'ı': 'I', 'İ': 'I', 'Ħ': 'H', 'ħ': 'H',
};

type NameGrid = { maxCols: number; maxLines: number };

const foldChar = (char: string): string => {
  if (SEPARATORS.has(char)) return ' ';
  const special = SPECIAL_FOLDS[char];
  if (special) return special;
  // NFD splits a precomposed letter into base + combining marks; uppercasing
  // first also expands the ligature-like cases the engine knows about.
  return char.normalize('NFD').toUpperCase().replace(/[^A-Z0-9 &]/g, '');
};

/** A display string reduced to drawable characters, with runs of space collapsed. */
const foldToGlyphs = (text: string): string =>
  [...text].map(foldChar).join('').replace(/\s+/g, ' ').trim();

/** Width of a line in grid columns, counting the double-width '&'. */
const columnsOf = (text: string): number =>
  [...text].reduce((cols, char) => cols + (char === '&' ? AMPERSAND_COLS : 1), 0);

/**
 * Splits one unbroken run of characters across the available rows. Reached only
 * by a word too wide to read even at the panel's shrink (see wrapName), never by
 * a word that merely overflows a row. Breaking those mid-word is the exact
 * defect the hand-placed breaks used to work around.
 */
const hardBreak = (word: string, maxLines: number): string[] => {
  const chars = [...word];
  const size = Math.ceil(chars.length / maxLines);
  const lines: string[] = [];
  for (let at = 0; at < chars.length && lines.length < maxLines; at += size) {
    const isLast = lines.length === maxLines - 1;
    lines.push(chars.slice(at, isLast ? chars.length : at + size).join(''));
  }
  return lines;
};

/**
 * Greedy word wrap: a word moves to the next row when it no longer fits, and the
 * final row keeps whatever is left (the panel shrinks it to fit). Every name
 * that used to carry a hand-placed break still breaks at that same space.
 */
const wrapWords = (words: string[], grid: NameGrid): string[] => {
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    if (!line) { line = word; continue; }
    const candidate = `${line} ${word}`;
    const isLastLine = lines.length === grid.maxLines - 1;
    if (isLastLine || columnsOf(candidate) <= grid.maxCols) { line = candidate; continue; }
    lines.push(line);
    line = word;
  }
  lines.push(line);
  return lines;
};

/**
 * Folds a name to drawable characters and lays it out on the panel grid.
 * Returns one entry per row; an empty name yields a single empty row so the
 * panel still reserves its space.
 */
const wrapName = (text: string, grid: NameGrid = NAME_PANEL_GRID): string[] => {
  const folded = foldToGlyphs(text);
  if (!folded) return [''];
  const words = folded.split(' ');
  // A lone word wider than every row combined cannot be shrunk into anything
  // readable, so it is the one case that gets broken mid-word.
  if (words.length === 1 && columnsOf(folded) > grid.maxCols * grid.maxLines) {
    return hardBreak(folded, grid.maxLines);
  }
  return wrapWords(words, grid);
};

export { foldToGlyphs, wrapName, NAME_PANEL_GRID };
export type { NameGrid };
