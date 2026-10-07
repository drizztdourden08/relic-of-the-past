/* @layer bridge-wasm @kind logic */
/**
 * Message text layout: a line already made drawable (dialogue-text.ts) is
 * word-wrapped against the real per-glyph pixel widths into the text box's
 * line commands ([2] and [3] for rows two and three, [Waitkey][Scroll] for
 * every row past the visible three, the engine renders variable-width glyphs
 * and never wraps on its own). The alphabet and widths are a charset's
 * (dialogue-charset.ts), so an extra glyph's token measures by its slot.
 *
 * A row past the third scrolls the top row off the box, and the engine never
 * waits on its own, so each of those breaks carries a [Waitkey] first. Without
 * it a long line pushes its own opening away before it can be read, which is
 * what the game's own long lines pause for.
 *
 * The highlight markup (highlight-markup.ts) passes through untouched and
 * measures zero pixels: it becomes control bytes the engine draws nothing for.
 */
import { balanceRows, isHighlightMarker, stripHighlight } from '@shared/randomizer/receipt-text/highlight-markup';

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
const WAIT_COMMAND = '[Waitkey]';
const LETTER_OR_DIGIT = /[\p{L}\p{N}]/u;

const pixelWidthOf = (word: string, alphabet: readonly string[], widths: Uint8Array): number => {
  let px = 0;
  for (const ch of word) {
    if (isHighlightMarker(ch)) continue;
    const index = alphabet.indexOf(ch);
    px += index >= 0 && index < widths.length ? widths[index] : FALLBACK_WIDTH_PX;
  }
  return px;
};

/** True for a word with no letter or digit: an arrow or another lone symbol. */
const isLoneSymbol = (word: string): boolean => {
  const bare = stripHighlight(word);
  return bare !== '' && !LETTER_OR_DIGIT.test(bare);
};

/**
 * The words that wrap as one: a lone symbol binds to the words on both sides, so a range
 * ("0 > 99") stays on one row and no row ends or starts with the arrow.
 */
const wrapUnits = (text: string): string[] => {
  const words = text.split(' ');
  const units: string[] = [];
  for (let i = 0; i < words.length; i += 1) {
    const word = words[i];
    if (isLoneSymbol(word) && units.length > 0 && i + 1 < words.length) {
      units[units.length - 1] += ` ${word} ${words[i + 1]}`;
      i += 1;
      continue;
    }
    units.push(word);
  }
  return units;
};

/** Word-wrap sanitized |text| into box rows against the real glyph widths. */
const wrapRows = (text: string, alphabet: readonly string[], widths: Uint8Array): string[] => {
  const spacePx = pixelWidthOf(' ', alphabet, widths);
  const rows: string[] = [];
  let row = '';
  let rowPx = 0;
  for (const word of wrapUnits(text)) {
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
  return balanceRows(rows);
};

/** Word-wrap sanitized |text| into box rows and join with the line commands. */
const wrapMessageText = (text: string, alphabet: readonly string[], widths: Uint8Array): string =>
  wrapRows(text, alphabet, widths)
    .map((line, i) => `${i < LINE_COMMANDS.length ? LINE_COMMANDS[i] : `${WAIT_COMMAND}${SCROLL_COMMAND}`}${line}`)
    .join('');

/** True when sanitized |text| wraps into at most |rows| rows. */
const fitsRows = (text: string, rows: number, alphabet: readonly string[], widths: Uint8Array): boolean =>
  wrapRows(text, alphabet, widths).length <= rows;

/** True when sanitized |text| shows without scrolling: at most the visible rows. */
const fitsVisibleRows = (text: string, alphabet: readonly string[], widths: Uint8Array): boolean =>
  fitsRows(text, VISIBLE_ROWS, alphabet, widths);

/**
 * The fullest of |candidates| (already sanitized, fullest first) that fits
 * the visible rows; the last one when none does.
 */
const fitReceiptLine = (candidates: readonly string[], alphabet: readonly string[], widths: Uint8Array): string =>
  candidates.find((candidate) => fitsVisibleRows(candidate, alphabet, widths)) ?? candidates[candidates.length - 1];

export { VISIBLE_ROWS, fitReceiptLine, fitsRows, fitsVisibleRows, wrapMessageText, wrapRows };
