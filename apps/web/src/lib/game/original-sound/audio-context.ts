/* @layer bridge-wasm @kind logic */
import { originalSoundState } from './original-sound-state';

const audioContext = (): AudioContext => {
  originalSoundState.context ??= new AudioContext();
  return originalSoundState.context;
};

export { audioContext };
