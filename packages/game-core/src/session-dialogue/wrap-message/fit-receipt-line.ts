/* @layer bridge-wasm @kind logic */
import { fitsVisibleRows } from './fits-visible-rows';
import { lastOf } from './last-of';

const fitReceiptLine = (candidates: readonly string[], alphabet: readonly string[], widths: Uint8Array): string =>
  candidates.find((candidate) => fitsVisibleRows(candidate, alphabet, widths))
  ?? lastOf(candidates, 'A receipt line has no text candidates');

export { fitReceiptLine };
