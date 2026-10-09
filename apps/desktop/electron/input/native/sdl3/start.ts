/* @layer electron-main @kind logic */
import type { Sdl3EventCallback } from './sdl3.type';
import { loadAddon } from './load-addon';

const start = (callback: Sdl3EventCallback): void => {
  loadAddon()?.start(callback);
};

export { start };
