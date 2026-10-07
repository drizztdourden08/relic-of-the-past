/* @layer bridge-wasm @kind logic */
// Shared WASM-call helpers: module guard + try/catch + count-prefixed array decode, so each
// bridge query is a short declaration of its packed layout.
import { getGameState, getModule } from '../wasm-bridge';
import type { EmscriptenModule } from '../types';

/** Read a little-endian 16-bit value from the heap at byte offset `o`. */
const readU16 = (heap: Uint8Array, o: number): number => heap[o] | (heap[o + 1] << 8);

/** Run `fn` only when the module is loaded AND the game is running; any throw returns `fallback`. */
const callWhenRunning = <T>(fallback: T, fn: (mod: EmscriptenModule) => T): T => {
  const mod = getModule();
  if (!mod || getGameState().status !== 'running') return fallback;
  try {
    return fn(mod);
  } catch {
    return fallback;
  }
};

interface TableLayout {
  /** Bytes the count header occupies when read (1 = u8, 2 = little-endian u16). */
  countBytes: 1 | 2;
  /** Offset from `ptr` where the first row begins (header size, usually 1 or 2). */
  dataStart: number;
  /** Per-row byte size. */
  stride: number;
  /** Defensive clamp on the decoded count (several C tables cap their length). */
  maxCount?: number;
}

/** Decode a count-prefixed packed array at heap pointer `ptr`. `decode(heap, off, index)` maps one row from its byte offset. */
const decodeCountPrefixed = <T>(
  mod: EmscriptenModule,
  ptr: number,
  layout: TableLayout,
  decode: (heap: Uint8Array, off: number, index: number) => T,
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

interface CallArgs {
  argTypes: string[];
  args: unknown[];
}

/** Guarded call returning a decoded count-prefixed array: calls the pointer-returning export, `[]` on null. */
const decodeTable = <T>(
  exportName: string,
  layout: TableLayout,
  decode: (heap: Uint8Array, off: number, index: number) => T,
  call?: CallArgs,
): T[] =>
  callWhenRunning<T[]>([], (mod) => {
    const ptr = mod.ccall(exportName, 'number', call?.argTypes ?? [], call?.args ?? []) as number;
    if (!ptr) return [];
    return decodeCountPrefixed(mod, ptr, layout, decode);
  });

/**
 * Decode a status-gated count-prefixed array. Byte 0 is a status flag: 0 when the export's gate
 * was closed (or the argument out of range), 1 when the count-prefixed table at byte 1 was
 * filled. Returns `null` on a closed gate, not `[]`, so "not allowed" and "nothing here" stay
 * distinct. C side: WasmGetRoomChests and friends (core/game-hooks/sim_queries.c).
 */
const decodeGatedTable = <T>(
  exportName: string,
  layout: TableLayout,
  decode: (heap: Uint8Array, off: number, index: number) => T,
  call?: CallArgs,
): T[] | null =>
  callWhenRunning<T[] | null>(null, (mod) => {
    const ptr = mod.ccall(exportName, 'number', call?.argTypes ?? [], call?.args ?? []) as number;
    if (!ptr || mod.HEAPU8[ptr] === 0) return null;
    return decodeCountPrefixed(mod, ptr + 1, layout, decode);
  });

/** Call a pointer-returning export under the running guard; `null` if unavailable. */
const callPtr = <T>(exportName: string, fromPtr: (mod: EmscriptenModule, ptr: number) => T | null, call?: CallArgs): T | null =>
  callWhenRunning<T | null>(null, (mod) => {
    const ptr = mod.ccall(exportName, 'number', call?.argTypes ?? [], call?.args ?? []) as number;
    if (!ptr) return null;
    return fromPtr(mod, ptr);
  });

/** Guarded scalar getter: the numeric export value or `fallback`. */
const numberCall = (exportName: string, fallback: number, call?: CallArgs): number =>
  callWhenRunning(fallback, (mod) => mod.ccall(exportName, 'number', call?.argTypes ?? [], call?.args ?? []) as number);

/** Guarded void command, a fire-and-forget ccall under the running guard. */
const voidCall = (exportName: string, call?: CallArgs): void =>
  callWhenRunning<void>(undefined, (mod) => {
    mod.ccall(exportName, null, call?.argTypes ?? [], call?.args ?? []);
  });

export { readU16, callWhenRunning, decodeCountPrefixed, decodeTable, decodeGatedTable, callPtr, numberCall, voidCall };
export type { TableLayout, CallArgs };
