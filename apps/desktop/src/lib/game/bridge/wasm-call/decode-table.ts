/* @layer bridge-wasm @kind logic */
import { callWhenRunning } from './call-when-running';
import { decodeCountPrefixed } from './decode-count-prefixed';
import type { CallArgs, RowDecoder, TableLayout } from './wasm-call.type';

const decodeTable = <T>(
  exportName: string,
  layout: TableLayout,
  decode: RowDecoder<T>,
  call?: CallArgs,
): T[] =>
  callWhenRunning<T[]>([], (mod) => {
    const ptr = mod.ccall(exportName, 'number', call?.argTypes ?? [], call?.args ?? []) as number;
    if (!ptr) return [];
    return decodeCountPrefixed(mod, ptr, layout, decode);
  });

export { decodeTable };
