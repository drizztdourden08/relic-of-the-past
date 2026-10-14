/* @layer renderer-lib @kind logic */
import { OPUZ_HEADER_BYTES } from './parse-opuz.constants';
import type { RangeEntry } from './parse-opuz.type';

const isUsableRange = (entry: RangeEntry, byteLength: number): boolean =>
  entry.samples !== 0 && entry.offset >= OPUZ_HEADER_BYTES && entry.offset < byteLength;

export { isUsableRange };
