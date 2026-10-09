/* @layer bridge-wasm @kind logic */
import { initMasterVolume } from './init-master-volume';
import { volumeState } from './volume-state';

const setMasterVolume = (volume: number): void => {
  volumeState.lastRequestedVolume = volume;
  if (volumeState.gainNode) {
    volumeState.gainNode.gain.value = volume / 100;
  } else {
    initMasterVolume(volume);
  }
};

export { setMasterVolume };
