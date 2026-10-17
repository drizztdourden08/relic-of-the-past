/* @layer bridge-wasm @kind logic */
import type { GameSettings } from '@rotp/features';

const toMasterVolume = (settings: Pick<GameSettings, 'masterVolume' | 'masterMuted'>): number =>
  settings.masterMuted ? 0 : settings.masterVolume;

export { toMasterVolume };
