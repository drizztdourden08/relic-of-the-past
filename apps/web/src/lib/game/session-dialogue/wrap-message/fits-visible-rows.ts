/* @layer bridge-wasm @kind logic */
import { VISIBLE_ROWS } from './wrap-message.constants';
import { fitsRows } from './fits-rows';

const fitsVisibleRows = (text: string, alphabet: readonly string[], widths: Uint8Array): boolean =>
  fitsRows(text, VISIBLE_ROWS, alphabet, widths);

export { fitsVisibleRows };
