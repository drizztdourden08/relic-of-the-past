/* @layer bridge-wasm @kind logic */
/** Game UI state buffer + overlay/menu mode (for the React overlay). */
import { getGameState, getModule } from '../wasm-bridge';

/**
 * Read the raw game UI state buffer from WASM.
 * Returns the HEAP pointer and HEAPU8 reference, or null if unavailable.
 */
const wasmGetGameUIState = (): { heap: Uint8Array; ptr: number } | null => {
  const mod = getModule();
  if (!mod || getGameState().status !== 'running') return null;
  try {
    const ptr = mod.ccall('WasmGetGameUIState', 'number', [], []) as number;
    if (!ptr) return null;
    return { heap: mod.HEAPU8, ptr };
  } catch {
    return null;
  }
};

/** Set the UI overlay mode bitmask (controls native rendering suppression). */
const wasmSetUIOverlayMode = (mode: number): void => {
  const mod = getModule();
  if (!mod || getGameState().status !== 'running') return;
  mod.ccall('WasmSetUIOverlayMode', null, ['number'], [mode]);
};

/** Get the current UI overlay mode bitmask. */
const wasmGetUIOverlayMode = (): number => {
  const mod = getModule();
  if (!mod || getGameState().status !== 'running') return 0;
  return mod.ccall('WasmGetUIOverlayMode', 'number', [], []) as number;
};

/**
 * Get in-game menu state: 0=gameplay, 1=opening, 2=open, 3=closing.
 * Used to sync enhanced HUD overlay transitions with the native pause animation.
 */
const wasmGetMenuState = (): number => {
  const mod = getModule();
  if (!mod || getGameState().status !== 'running') return 0;
  try {
    return mod.ccall('WasmGetMenuState', 'number', [], []) as number;
  } catch {
    return 0;
  }
};

export { wasmGetGameUIState, wasmSetUIOverlayMode, wasmGetUIOverlayMode, wasmGetMenuState };
