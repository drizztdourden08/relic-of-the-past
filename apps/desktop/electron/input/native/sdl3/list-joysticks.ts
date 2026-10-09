/* @layer electron-main @kind logic */
import type { JoystickInfo } from './sdl3.type';
import { loadAddon } from './load-addon';

const listJoysticks = (): JoystickInfo[] => {
  return loadAddon()?.listJoysticks() ?? [];
};

export { listJoysticks };
