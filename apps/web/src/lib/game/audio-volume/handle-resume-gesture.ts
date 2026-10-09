/* @layer bridge-wasm @kind logic */
import { GESTURE_EVENTS } from './audio-volume.constants';
import { getSDL2Audio } from './get-sdl2-audio';

const handleResumeGesture = (): void => {
  const sdl2 = getSDL2Audio();
  const stop = () => GESTURE_EVENTS.forEach((evt) => window.removeEventListener(evt, handleResumeGesture, true));
  if (!sdl2 || sdl2.audioContext.state === 'running') { stop(); return; }
  sdl2.audioContext.resume()
    .then(() => { if (getSDL2Audio()?.audioContext.state === 'running') stop(); })
    .catch(() => undefined);
};

export { handleResumeGesture };
