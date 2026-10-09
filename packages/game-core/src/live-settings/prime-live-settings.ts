/* @layer bridge-wasm @kind logic */
import type { GameSettings } from '@rotp/features';
import { liveHidesOf } from './live-hides-of';
import { liveSettingsState } from './live-settings-state';
import { toWasmVolume } from './to-wasm-volume';

const primeLiveSettings = (settings: GameSettings): void => {
  const state = liveSettingsState;
  const hides = liveHidesOf(settings);
  state.settings = settings;
  state.hideSpaceBeyondWalls = hides.hideSpaceBeyondWalls;
  state.vsync = !!settings.vsync;
  state.hudHidden = hides.hudHidden;
  state.pauseHidden = hides.pauseHidden;
  state.masterVolume = settings.masterVolume;
  state.musicVol = toWasmVolume(settings.musicVolume, settings.musicMuted);
  state.sfxVol = toWasmVolume(settings.sfxVolume, settings.sfxMuted);
  state.extraDungeon = !!settings.extraDungeon;
};

export { primeLiveSettings };
