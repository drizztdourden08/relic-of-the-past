/* @layer bridge-wasm @kind logic */
import type { OriginalSound } from './original-sound.type';

const originalSoundState = {
  context: null as AudioContext | null,
  playing: null as AudioBufferSourceNode | null,
  cache: new Map<string, OriginalSound>(),
};

export { originalSoundState };
