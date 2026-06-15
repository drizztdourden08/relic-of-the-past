/* @layer bridge-wasm @kind logic */
/**
 * Shared WASM-call helpers — the guard / decode primitives every `bridge/*`
 * module was hand-rolling. Collapses the repeated "module-guard + try/catch +
 * count-prefixed array decode" boilerplate into a handful of reusable functions
 * so each bridge query is a 1-4 line declaration of its packed layout.
 */
import { getGameState, getModule } from '../wasm-bridge';
import type { EmscriptenModule } from '../types';

/** Read a little-endian 16-bit value from the heap at byte offset `o`. */
const readU16 = (heap: Uint8Array, o: number): number => heap[o] | (heap[o + 1] << 8);

/**
 * Run `fn` only when the module is loaded AND the game is running, swallowing
 * any throw and returning `fallback` instead. This is the single guard that
 * every bridge query repeated inline.
 */
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

/**
 * Decode a count-prefixed packed array sitting at heap pointer `ptr`.
 * `decode(heap, off, index)` maps a single row from its byte offset.
 */
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

/**
 * Guarded call that returns a decoded count-prefixed array — the dominant bridge
 * pattern. Calls the pointer-returning export, bails to `[]` on null, and decodes.
 */
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

/** Call a pointer-returning export under the running guard; `null` if unavailable. */
const callPtr = <T>(exportName: string, fromPtr: (mod: EmscriptenModule, ptr: number) => T | null, call?: CallArgs): T | null =>
  callWhenRunning<T | null>(null, (mod) => {
    const ptr = mod.ccall(exportName, 'number', call?.argTypes ?? [], call?.args ?? []) as number;
    if (!ptr) return null;
    return fromPtr(mod, ptr);
  });

/** Guarded scalar getter — returns the numeric export value or `fallback`. */
const numberCall = (exportName: string, fallback: number, call?: CallArgs): number =>
  callWhenRunning(fallback, (mod) => mod.ccall(exportName, 'number', call?.argTypes ?? [], call?.args ?? []) as number);

/** Guarded void command — fire-and-forget ccall under the running guard. */
const voidCall = (exportName: string, call?: CallArgs): void =>
  callWhenRunning<void>(undefined, (mod) => {
    mod.ccall(exportName, null, call?.argTypes ?? [], call?.args ?? []);
  });

export { readU16, callWhenRunning, decodeCountPrefixed, decodeTable, callPtr, numberCall, voidCall };
export type { TableLayout, CallArgs };
