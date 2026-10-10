/* @layer bridge-wasm @kind logic */
import { getSDL2Audio } from './get-sdl2-audio';

const resumeAudio = (): void => {
  const sdl2 = getSDL2Audio();
  if (sdl2?.audioContext.state === 'suspended') {
    void sdl2.audioContext.resume();
  }
};

export { resumeAudio };
