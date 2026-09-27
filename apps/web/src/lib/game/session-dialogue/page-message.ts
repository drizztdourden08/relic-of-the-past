/* @layer bridge-wasm @kind logic */
/**
 * A detail page laid out the way the game moves a long line on to its next box.
 *
 * The core shows a detail page right after the receipt's own line, in the same box
 * (receipt_pages.c joins the two). The engine has no command that clears the box, so the
 * page opens with a key wait, then each of its rows scrolls in from the bottom. Three scrolls
 * push every row of the first page away, so a page shorter than the box scrolls in empty rows
 * after its own and never shares the box with the page before it. A page past three rows
 * waits for a key again before each further row, as a long line does (wrap-message.ts).
 *
 * The page keeps the fullest wording that fits the box on its own, like any other line.
 */

import { VISIBLE_ROWS, fitReceiptLine, wrapRows } from './wrap-message';
import type { DialogueCharset } from '@shared/game/dialog/dialogue-charset';

const SCROLL_COMMAND = '[Scroll]';
const WAIT_COMMAND = '[Waitkey]';

/** The page's rows, padded with empty ones to fill the box. */
const paddedRows = (rows: readonly string[]): string[] =>
  [...rows, ...Array.from({ length: Math.max(0, VISIBLE_ROWS - rows.length) }, () => '')];

/** The whole page, key wait first. |candidates| are drawable already, fullest first. */
const pageMessageText = (candidates: readonly string[], charset: DialogueCharset): string => {
  const { alphabet, widths } = charset;
  const rows = wrapRows(fitReceiptLine(candidates, alphabet, widths), alphabet, widths);
  const scrolled = paddedRows(rows)
    .map((row, index) => `${index < VISIBLE_ROWS ? '' : WAIT_COMMAND}${SCROLL_COMMAND}${row}`)
    .join('');
  return `${WAIT_COMMAND}${scrolled}`;
};

export { pageMessageText };
