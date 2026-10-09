/* @layer bridge-wasm @kind logic */
import { setMasterVolume } from '../audio-volume';
import { getModule } from '../wasm-bridge';
import { liveSettingsState } from './live-settings-state';
import { toWasmVolume } from './to-wasm-volume';
import { tryVoidCcall } from './try-void-ccall';

const reassertVolumes = (): void => {
  if (!getModule()) return;
  const { masterVolume, musicVol, ambientVol, sfxVol } = liveSettingsState;
  setMasterVolume(masterVolume);
  tryVoidCcall('WasmSetAppMasterVolume', toWasmVolume(masterVolume));
  tryVoidCcall('WasmSetMusicVolume', musicVol);
  tryVoidCcall('WasmSetAmbientVolume', ambientVol);
  tryVoidCcall('WasmSetSfxVolume', sfxVol);
};

export { reassertVolumes };
