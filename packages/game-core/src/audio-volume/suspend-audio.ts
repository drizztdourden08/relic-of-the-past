/* @layer bridge-wasm @kind logic */
import { getSDL2Audio } from './get-sdl2-audio';

const suspendAudio = (): void => {
  const sdl2 = getSDL2Audio();
  if (sdl2?.audioContext.state === 'running') {
    sdl2.audioContext.suspend();
  }
};

export { suspendAudio };
