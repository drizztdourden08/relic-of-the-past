/* @layer bridge-wasm @kind logic */
import { wrapRows } from './wrap-rows';

const fitsRows = (text: string, rows: number, alphabet: readonly string[], widths: Uint8Array): boolean =>
  wrapRows(text, alphabet, widths).length <= rows;

export { fitsRows };
