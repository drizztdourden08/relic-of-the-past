/* @layer bridge-wasm @kind logic */
import { getModule } from '../wasm-bridge';
import type { Sdl2Audio, Sdl2ModuleAudio } from './audio-volume.type';

const getSDL2Audio = (): Sdl2Audio | null => {
  const mod = getModule() as unknown as { SDL2?: Sdl2ModuleAudio } | null;
  const sdl2 = mod?.SDL2;
  if (!sdl2?.audioContext || !sdl2?.audio?.scriptProcessorNode) return null;
  return { audioContext: sdl2.audioContext, scriptProcessorNode: sdl2.audio.scriptProcessorNode };
};

export { getSDL2Audio };
