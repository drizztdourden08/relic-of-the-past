/* @layer bridge-wasm @kind logic */
import type { MasterAudioTarget } from './audio-volume.type';
import { getSDL2Audio } from './get-sdl2-audio';
import { initMasterVolume } from './init-master-volume';
import { volumeState } from './volume-state';

const getMasterAudioTarget = (): MasterAudioTarget | null => {
  const sdl2 = getSDL2Audio();
  if (!sdl2) return null;
  if (!volumeState.gainNode) initMasterVolume(volumeState.pendingVolume ?? volumeState.lastRequestedVolume);
  return { ctx: sdl2.audioContext, node: volumeState.gainNode ?? sdl2.audioContext.destination };
};

export { getMasterAudioTarget };
