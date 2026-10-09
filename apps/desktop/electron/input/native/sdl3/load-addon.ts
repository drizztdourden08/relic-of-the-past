/* @layer electron-main @kind logic */
import { existsSync } from 'fs';
import type { Sdl3Input } from './sdl3.type';
import { addonCandidates } from './addon-candidates';
import { addonState } from './addon-state';

const resolveAddonPath = (): string | null => {
  return addonCandidates().find(candidate => existsSync(candidate)) ?? null;
};

const loadAddon = (): Sdl3Input | null => {
  if (addonState.attempted) return addonState.addon;
  addonState.attempted = true;
  const addonPath = resolveAddonPath();
  if (!addonPath) {
    console.log('[SDL3] native addon not found, controller transport disabled. Tried:');
    addonCandidates().forEach(candidate => console.log(`  ${candidate}`));
    return addonState.addon;
  }
  try {
    addonState.addon = require(addonPath) as Sdl3Input;
  } catch (e) {
    console.log(`[SDL3] failed to load native addon: ${e instanceof Error ? e.message : String(e)}`);
    addonState.addon = null;
  }
  return addonState.addon;
};

export { loadAddon };
