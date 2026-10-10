/* @layer bridge-wasm @kind logic */
import type { EmscriptenModule } from '../types';
import type { CoreRuntimeExtras } from './lifecycle.type';

const stopCoreMainLoop = (mod: EmscriptenModule): void => {
  try {
    mod.ccall('WasmStop', null, [], []);
  } catch {
    
  }
};

const releaseCoreModule = (mod: EmscriptenModule): void => {
  stopCoreMainLoop(mod);
  const { SDL2: sdl2, canvas } = mod as EmscriptenModule & CoreRuntimeExtras;
  if (sdl2?.audio?.scriptProcessorNode) sdl2.audio.scriptProcessorNode.disconnect();
  if (sdl2?.capture?.scriptProcessorNode) sdl2.capture.scriptProcessorNode.disconnect();
  if (sdl2?.audioContext) sdl2.audioContext.close().catch(() => {});
  canvas?.getContext('webgl')?.getExtension('WEBGL_lose_context')?.loseContext();
};

export { releaseCoreModule };
