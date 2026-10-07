/* @layer bridge-wasm @kind logic */
/** Dialog mirror snapshot, pacing and native-box hiding (core/game-hooks/dialog_*.c). */
import { callPtr, readU16, voidCall } from './wasm-call';

interface HeapView {
  heap: Uint8Array;
  ptr: number;
}

interface FontView extends HeapView {
  size: number;
}

/** The mirror snapshot; null when the module is not running or the HUD override gate is closed. */
const wasmGetDialogState = (): HeapView | null =>
  callPtr('WasmGetDialogState', (mod, ptr) => ({ heap: mod.HEAPU8, ptr }));

/** Pacing in 1/4 units (4 = 1x, 0 = instant), plus the hold-A and B-fill switches. */
const wasmSetDialogPacing = (baseQ4: number, holdQ4: number, holdOn: boolean, fillOn: boolean): void =>
  voidCall('WasmSetDialogPacing', {
    argTypes: ['number', 'number', 'number', 'number'],
    args: [baseQ4, holdQ4, holdOn ? 1 : 0, fillOn ? 1 : 0],
  });

/** Whether the native box should stay off VRAM because the host draws its own. */
const wasmSetDialogHidden = (hidden: boolean): void =>
  voidCall('WasmSetDialogHidden', { argTypes: ['number'], args: [hidden ? 1 : 0] });

/**
 * The active language's glyph sheet (which = 0) or width table (which = 1), as a view into the
 * loaded asset blob. Null when the render-queries gate is closed.
 */
const wasmGetDialogFont = (which: 0 | 1): FontView | null =>
  callPtr('WasmGetDialogFont', (mod, ptr) => {
    const size = mod.ccall('WasmGetDialogFontSize', 'number', ['number'], [which]) as number;
    return size > 0 ? { heap: mod.HEAPU8, ptr, size } : null;
  }, { argTypes: ['number'], args: [which] });

/** The four SNES colour words the text box draws with this frame, or null when gated off. */
const wasmGetDialogPalette = (): number[] | null =>
  callPtr('WasmGetDialogPalette', (mod, ptr) => [0, 1, 2, 3].map((i) => readU16(mod.HEAPU8, ptr + i * 2)));

/** Tell the core a state was loaded: the native box shows until the next message starts. */
const wasmDialogMarkStale = (): void => voidCall('WasmDialogMarkStale');

export { wasmGetDialogState, wasmSetDialogPacing, wasmSetDialogHidden, wasmGetDialogFont, wasmGetDialogPalette, wasmDialogMarkStale };
export type { FontView, HeapView };
