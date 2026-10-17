/* @layer bridge-wasm @kind logic */
import type { GameSettings } from '@rotp/features';
import { setMasterVolume, callIfExported, liveSettingsState, toMasterVolume, toWasmVolume } from '@rotp/game-core';
import { msuSyncVolume } from '../msu-session/msu-sync-volume';
import type { EmscriptenModule } from '@rotp/game-core';

const pushVolumes = (mod: EmscriptenModule, settings: GameSettings): void => {
  const state = liveSettingsState;
  const masterVolume = toMasterVolume(settings);
  setMasterVolume(masterVolume);
  state.masterVolume = masterVolume;
  callIfExported(() => mod.ccall('WasmSetAppMasterVolume', null, ['number'], [toWasmVolume(masterVolume)]));
  const musicVol = toWasmVolume(settings.musicVolume, settings.musicMuted);
  const ambientVol = toWasmVolume(settings.ambientVolume, settings.ambientMuted);
  const sfxVol = toWasmVolume(settings.sfxVolume, settings.sfxMuted);
  callIfExported(() => { mod.ccall('WasmSetMusicVolume', null, ['number'], [musicVol]); state.musicVol = musicVol; });
  callIfExported(() => { mod.ccall('WasmSetAmbientVolume', null, ['number'], [ambientVol]); state.ambientVol = ambientVol; });
  callIfExported(() => { mod.ccall('WasmSetSfxVolume', null, ['number'], [sfxVol]); state.sfxVol = sfxVol; });
  msuSyncVolume();
};

export { pushVolumes };
