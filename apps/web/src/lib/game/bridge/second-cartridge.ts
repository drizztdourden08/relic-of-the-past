/* @layer bridge-wasm @kind logic */
/**
 * Optional second-cartridge content (core/game-hooks/gba_alttp.c).
 *
 * Two separate questions, deliberately not collapsed into one:
 *   available — the supplement container is present in the asset blob.
 *   enabled   — the player asked for the extra content.
 *
 * Both must hold before anything appears in the world, so owning the cartridge with the
 * option switched off still gives an untouched overworld. The core defaults to disabled,
 * so a host that never calls the setter behaves exactly like the base game.
 */
import { numberCall, voidCall } from './wasm-call';

const setExtraDungeonEnabled = (on: boolean): void =>
  voidCall('WasmSetExtraDungeonEnabled', { argTypes: ['number'], args: [on ? 1 : 0] });

/** Whether the loaded asset blob actually carries the supplement container. */
const isExtraDungeonAvailable = (): boolean =>
  numberCall('WasmGetExtraDungeonAvailable', 0, { argTypes: [], args: [] }) === 1;

export { isExtraDungeonAvailable, setExtraDungeonEnabled };
