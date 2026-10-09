/* @layer bridge-wasm @kind logic */
import { originalSoundState } from './original-sound-state';

const stopOriginalSound = (): void => {
  if (originalSoundState.playing === null) return;
  const source = originalSoundState.playing;
  originalSoundState.playing = null;
  source.onended = null;
  source.stop();
};

export { stopOriginalSound };
