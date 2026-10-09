/* @layer bridge-wasm @kind logic */
import type { EmscriptenModule } from '../../types';
import { readU16 } from './read-u16';
import type { RowDecoder, TableLayout } from './wasm-call.type';

const decodeCountPrefixed = <T>(
  mod: EmscriptenModule,
  ptr: number,
  layout: TableLayout,
  decode: RowDecoder<T>,
): T[] => {
  const { countBytes, dataStart, stride, maxCount } = layout;
  const heap = mod.HEAPU8;
  const raw = countBytes === 2 ? readU16(heap, ptr) : heap[ptr];
  const count = maxCount != null ? Math.min(raw, maxCount) : raw;
  const out: T[] = [];
  for (let i = 0; i < count; i++) {
    out.push(decode(heap, ptr + dataStart + i * stride, i));
  }
  return out;
};

export { decodeCountPrefixed };
