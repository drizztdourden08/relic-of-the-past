/* @layer bridge-wasm @kind logic */
/**
 * Message text preparation — makes an arbitrary rendered line encodable and
 * displayable: characters outside the active language's alphabet are mapped
 * to shared equivalents (or dropped), and the text is word-wrapped against
 * the real per-glyph pixel widths into the text box's line commands ([2] and
 * [3] for rows two and three, [Scroll] for every row past the visible three —
 * the engine renders variable-width glyphs and never wraps on its own).
 */

/**
 * Usable pixels per text-box row, minus a safety margin: the engine draws 21
 * tiles of 8 px per row (messaging.c RenderText_Refresh) and advances the
 * pen by each glyph's own width (VWF_RenderSingle), never wrapping.
 */
const LINE_WIDTH_PX = 164;
/** Rows the box shows at once; a fourth row scrolls the first away. */
const VISIBLE_ROWS = 3;
/** Width assumed for a character missing from the width table. */
const FALLBACK_WIDTH_PX = 8;

const LINE_COMMANDS = ['', '[2]', '[3]'];
const SCROLL_COMMAND = '[Scroll]';

/** Substitutions for characters most alphabets lack but can approximate. */
const REPLACEMENTS: ReadonlyMap<string, string> = new Map([
  ['—', '-'], ['–', '-'], [':', ' -'], [';', ','],
  ['‘', "'"], ['’', "'"], ['“', '"'], ['”', '"'],
  ['&', 'and'], ['>', ' to '],
]);

/** Single-character alphabet entries (bracket glyph tokens are not typeable text). */
const charSetOf = (alphabet: readonly string[]): Set<string> =>
  new Set(alphabet.filter((entry) => entry.length === 1));

/** Map |text| onto the alphabet: substitute what can be, drop what cannot. */
const sanitizeForAlphabet = (text: string, alphabet: readonly string[]): string => {
  const chars = charSetOf(alphabet);
  let out = '';
  for (const ch of text) {
    if (chars.has(ch)) { out += ch; continue; }
    const replacement = REPLACEMENTS.get(ch) ?? '';
    for (const sub of replacement) { if (chars.has(sub)) out += sub; }
  }
  return out.replace(/ {2,}/g, ' ').trim();
};

const pixelWidthOf = (word: string, alphabet: readonly string[], widths: Uint8Array): number => {
  let px = 0;
  for (const ch of word) {
    const index = alphabet.indexOf(ch);
    px += index >= 0 && index < widths.length ? widths[index] : FALLBACK_WIDTH_PX;
  }
  return px;
};

/** Word-wrap sanitized |text| into box rows against the real glyph widths. */
const wrapRows = (text: string, alphabet: readonly string[], widths: Uint8Array): string[] => {
  const spacePx = pixelWidthOf(' ', alphabet, widths);
  const rows: string[] = [];
  let row = '';
  let rowPx = 0;
  for (const word of text.split(' ')) {
    const wordPx = pixelWidthOf(word, alphabet, widths);
    if (row !== '' && rowPx + spacePx + wordPx > LINE_WIDTH_PX) {
      rows.push(row);
      row = word;
      rowPx = wordPx;
      continue;
    }
    rowPx += row === '' ? wordPx : spacePx + wordPx;
    row = row === '' ? word : `${row} ${word}`;
  }
  if (row !== '') rows.push(row);
  return rows;
};

/** Word-wrap sanitized |text| into box rows and join with the line commands. */
const wrapMessageText = (text: string, alphabet: readonly string[], widths: Uint8Array): string =>
  wrapRows(text, alphabet, widths)
    .map((line, i) => `${i < LINE_COMMANDS.length ? LINE_COMMANDS[i] : SCROLL_COMMAND}${line}`)
    .join('');

/** True when sanitized |text| shows without scrolling: at most the visible rows. */
const fitsVisibleRows = (text: string, alphabet: readonly string[], widths: Uint8Array): boolean =>
  wrapRows(text, alphabet, widths).length <= VISIBLE_ROWS;

/**
 * The fullest of |candidates| (already sanitized, fullest first) that fits
 * the visible rows; the last one when none does.
 */
const fitReceiptLine = (candidates: readonly string[], alphabet: readonly string[], widths: Uint8Array): string =>
  candidates.find((candidate) => fitsVisibleRows(candidate, alphabet, widths)) ?? candidates[candidates.length - 1];

export { VISIBLE_ROWS, fitReceiptLine, fitsVisibleRows, sanitizeForAlphabet, wrapMessageText, wrapRows };
