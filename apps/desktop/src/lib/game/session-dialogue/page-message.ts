/* @layer bridge-wasm @kind logic */
import { VISIBLE_ROWS, fitReceiptLine, wrapRows } from './wrap-message';
import { SCROLL_COMMAND, WAIT_COMMAND } from './message-commands.constants';
import type { DialogueCharset } from '@rotp/game-data';

const paddedRows = (rows: readonly string[]): string[] =>
  [...rows, ...Array.from({ length: Math.max(0, VISIBLE_ROWS - rows.length) }, () => '')];

const pageMessageText = (candidates: readonly string[], charset: DialogueCharset): string => {
  const { alphabet, widths } = charset;
  const rows = wrapRows(fitReceiptLine(candidates, alphabet, widths), alphabet, widths);
  const scrolled = paddedRows(rows)
    .map((row, index) => `${index < VISIBLE_ROWS ? '' : WAIT_COMMAND}${SCROLL_COMMAND}${row}`)
    .join('');
  return `${WAIT_COMMAND}${scrolled}`;
};

export { pageMessageText };
