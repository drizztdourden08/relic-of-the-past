/* @layer bridge-wasm @kind logic */
/** Game commands — pause, reset, cheats, backdrop. */
import { getGameState, getModule } from '../wasm-bridge';

/** Pause or unpause the game at the WASM/C level. */
const wasmSetPaused = (paused: boolean): void => {
  const mod = getModule();
  if (!mod || getGameState().status !== 'running') return;
  mod.ccall('WasmSetPaused', null, ['number'], [paused ? 1 : 0]);
};

/** Query whether the game is paused at the WASM/C level. */
const wasmGetPaused = (): boolean => {
  const mod = getModule();
  if (!mod || getGameState().status !== 'running') return false;
  return mod.ccall('WasmGetPaused', 'number', [], []) !== 0;
};

/** Toggle game pause at the WASM/C level. */
const wasmTogglePause = (): void => {
  const mod = getModule();
  if (!mod || getGameState().status !== 'running') return;
  mod.ccall('WasmTogglePause', null, [], []);
};

/** Reset the game. warm=true preserves SRAM, warm=false is a cold reset. */
const wasmReset = (warm: boolean): void => {
  const mod = getModule();
  if (!mod || getGameState().status !== 'running') return;
  mod.ccall('WasmReset', null, ['number'], [warm ? 1 : 0]);
};

/** Execute a cheat command. 'w' = health, 'W' = equipment, 'o' = keys. */
const wasmCheat = (cmd: string): void => {
  const mod = getModule();
  if (!mod || getGameState().status !== 'running') return;
  mod.ccall('WasmCheat', null, ['number'], [cmd.charCodeAt(0)]);
};

/** Force the PPU backdrop color (CGRAM[0]) to black every frame. */
const wasmSetForceBackdropBlack = (enabled: boolean): void => {
  const mod = getModule();
  if (!mod || getGameState().status !== 'running') return;
  mod.ccall('WasmSetForceBackdropBlack', null, ['number'], [enabled ? 1 : 0]);
};

export { wasmSetPaused, wasmGetPaused, wasmTogglePause, wasmReset, wasmCheat, wasmSetForceBackdropBlack };
