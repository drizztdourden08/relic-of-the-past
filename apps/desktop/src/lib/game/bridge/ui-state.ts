/* @layer bridge-wasm @kind logic */
/** Game UI state buffer + overlay/menu mode (for the React overlay). */
import { callPtr, numberCall, voidCall } from './wasm-call';

/**
 * Read the raw game UI state buffer from WASM.
 * Returns the HEAP pointer and HEAPU8 reference, or null if unavailable.
 */
const wasmGetGameUIState = (): { heap: Uint8Array; ptr: number } | null =>
  callPtr('WasmGetGameUIState', (mod, ptr) => ({ heap: mod.HEAPU8, ptr }));

/** Set the UI overlay mode bitmask (controls native rendering suppression). */
const wasmSetUIOverlayMode = (mode: number): void =>
  voidCall('WasmSetUIOverlayMode', { argTypes: ['number'], args: [mode] });

/** Get the current UI overlay mode bitmask. */
const wasmGetUIOverlayMode = (): number => numberCall('WasmGetUIOverlayMode', 0);

/**
 * Get in-game menu state: 0=gameplay, 1=opening, 2=open, 3=closing.
 * Used to sync enhanced HUD overlay transitions with the native pause animation.
 */
const wasmGetMenuState = (): number => numberCall('WasmGetMenuState', 0);

export { wasmGetGameUIState, wasmSetUIOverlayMode, wasmGetUIOverlayMode, wasmGetMenuState };
