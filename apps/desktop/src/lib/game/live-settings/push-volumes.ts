/* @layer bridge-wasm @kind logic */
import type { GameSettings } from '@rotp/features';
import { setMasterVolume } from '../audio-volume';
import { msuSyncVolume } from '../msu-session';
import type { EmscriptenModule } from '../types';
import { callIfExported } from './call-if-exported';
import { liveSettingsState } from './live-settings-state';
import { toWasmVolume } from './to-wasm-volume';

const pushVolumes = (mod: EmscriptenModule, settings: GameSettings): void => {
  const state = liveSettingsState;
  setMasterVolume(settings.masterVolume);
  state.masterVolume = settings.masterVolume;
  callIfExported(() => mod.ccall('WasmSetAppMasterVolume', null, ['number'], [toWasmVolume(settings.masterVolume)]));
  const musicVol = toWasmVolume(settings.musicVolume, settings.musicMuted);
  const ambientVol = toWasmVolume(settings.ambientVolume, settings.ambientMuted);
  const sfxVol = toWasmVolume(settings.sfxVolume, settings.sfxMuted);
  callIfExported(() => { mod.ccall('WasmSetMusicVolume', null, ['number'], [musicVol]); state.musicVol = musicVol; });
  callIfExported(() => { mod.ccall('WasmSetAmbientVolume', null, ['number'], [ambientVol]); state.ambientVol = ambientVol; });
  callIfExported(() => { mod.ccall('WasmSetSfxVolume', null, ['number'], [sfxVol]); state.sfxVol = sfxVol; });
  msuSyncVolume();
};

export { pushVolumes };
