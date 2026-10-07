/* @layer bridge-wasm @kind logic */
/**
 * The six `WasmHost*` ccalls behind the host-owned pause menu and modern controls.
 *
 * This is the only file in the app that spells those export names. Everything above it
 * goes through `lib/game/host-menu.ts`, which adds the wanted-state and re-assert rules;
 * nothing here holds state of its own.
 *
 * Both gates are checked on the C side at every call (`core/game-hooks/host_menu.c`), so
 * these stay plain fire-and-forget commands. See `docs/hooks/host-menu.md`.
 */
import { numberCall, voidCall } from './wasm-call';

const numArg = (n: number): { argTypes: string[]; args: unknown[] } => ({ argTypes: ['number'], args: [n] });

/** Record the host's standing takeover request. Deferred on the C side, like WasmSetHudHidden. */
const wasmHostMenuSetTakeover = (on: boolean): void =>
  voidCall('WasmHostMenuSetTakeover', numArg(on ? 1 : 0));

/** The "continue" exit. Hands the menu state machine back where the vanilla branch does. */
const wasmHostMenuClose = (): void => voidCall('WasmHostMenuClose');

/** The "save and quit" exit. Rebuilds the HUD, then hands off to the save-and-quit module. */
const wasmHostMenuSaveAndQuit = (): void => voidCall('WasmHostMenuSaveAndQuit');

/** Write the core's single equipped-item register. `hudItem` is a new-style id, 1..24. */
const wasmHostSetActiveItem = (hudItem: number): void =>
  voidCall('WasmHostSetActiveItem', numArg(hudItem));

/** 1 while the takeover is in force and the gate allows it. */
const wasmHostMenuIsHolding = (): boolean => numberCall('WasmHostMenuIsHolding', 0) !== 0;

/** `kind`: 0 blade (0-4), 1 guard (0-3), 2 armour (0-2), 3 arrow type (0-1). Repaints and
 *  re-derives in one call; the arrow write preserves the register's ammunition half. */
const wasmHostSetGear = (kind: number, tier: number): void =>
  voidCall('WasmHostSetGear', { argTypes: ['number', 'number'], args: [kind, tier] });

export {
  wasmHostMenuClose, wasmHostMenuIsHolding, wasmHostMenuSaveAndQuit, wasmHostMenuSetTakeover,
  wasmHostSetActiveItem, wasmHostSetGear,
};
