/* @layer bridge-wasm @kind logic */
import type { LiveSettingsState } from './live-settings.type';

const liveSettingsState: LiveSettingsState = {
  hideSpaceBeyondWalls: false,
  vsync: false,
  extraDungeon: false,
  hudHidden: false,
  pauseHidden: false,
  masterVolume: 100,
  musicVol: 128,
  ambientVol: 128,
  sfxVol: 128,
  settings: null,
};

export { liveSettingsState };
