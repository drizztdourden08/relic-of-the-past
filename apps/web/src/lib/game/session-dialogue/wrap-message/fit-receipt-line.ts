/* @layer bridge-wasm @kind logic */
import { fitsVisibleRows } from './fits-visible-rows';

const fitReceiptLine = (candidates: readonly string[], alphabet: readonly string[], widths: Uint8Array): string =>
  candidates.find((candidate) => fitsVisibleRows(candidate, alphabet, widths)) ?? candidates[candidates.length - 1];

export { fitReceiptLine };
