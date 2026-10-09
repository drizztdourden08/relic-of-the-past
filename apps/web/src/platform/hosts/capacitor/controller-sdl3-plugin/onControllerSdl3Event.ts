/* @layer renderer-other @kind logic */
import type { Sdl3AndroidEvent } from '../controller-sdl3.type';
import { controllerSdl3Plugin } from './controllerSdl3Plugin';

const onControllerSdl3Event = (cb: (event: Sdl3AndroidEvent) => void): (() => void) => {
  const handle = controllerSdl3Plugin().addListener('controllerEvent', cb);
  return () => { handle.then((h) => h.remove()).catch(() => {}); };
};

export { onControllerSdl3Event };
