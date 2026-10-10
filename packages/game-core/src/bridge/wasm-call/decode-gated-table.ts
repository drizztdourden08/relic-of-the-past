/* @layer bridge-wasm @kind logic */
import { callWhenRunning } from './call-when-running';
import { decodeCountPrefixed } from './decode-count-prefixed';
import type { CallArgs, RowDecoder, TableLayout } from './wasm-call.type';

const decodeGatedTable = <T>(
  exportName: string,
  layout: TableLayout,
  decode: RowDecoder<T>,
  call?: CallArgs,
): T[] | null =>
  callWhenRunning<T[] | null>(null, (mod) => {
    const ptr = mod.ccall(exportName, 'number', call?.argTypes ?? [], call?.args ?? []);
    if (!ptr || mod.HEAPU8[ptr] === 0) return null;
    return decodeCountPrefixed(mod, ptr + 1, layout, decode);
  });

export { decodeGatedTable };
