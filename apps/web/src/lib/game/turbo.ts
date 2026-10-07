/* @layer bridge-wasm @kind logic */
/**
 * Turbo bridge: the configured speed goes down with the other live settings, the held state goes
 * down on the shortcut's press and release. Both are pacing globals in the core, so a save-state
 * load never disturbs them and nothing needs re-asserting afterwards.
 */
import type { GameSettings } from '@shared/types/settings';
import { turboSpeedPercent } from '@shared/display/turbo-speed';
import { getModule } from './wasm-bridge';

/** Percent the core is told: the ladder value while enabled, 100 (real time) otherwise. */
const turboPercentFor = (settings: GameSettings): number =>
  settings.turboEnabled ? turboSpeedPercent(settings.turboSpeed) : 100;

/** Push the configured speed. Guarded: a core built before turbo existed lacks the export. */
const pushTurboSpeed = (settings: GameSettings): void => {
  const mod = getModule();
  if (!mod) return;
  try { mod.ccall('WasmSetTurboSpeed', null, ['number'], [turboPercentFor(settings)]); } catch { /* WASM not rebuilt yet */ }
};

/** Hold or release turbo. A no-op before the module exists, and harmless while the speed is 100. */
const setTurboHeld = (held: boolean): void => {
  const mod = getModule();
  if (!mod) return;
  try { mod.ccall('WasmSetTurboHeld', null, ['number'], [held ? 1 : 0]); } catch { /* WASM not rebuilt yet */ }
};

export { pushTurboSpeed, setTurboHeld, turboPercentFor };
