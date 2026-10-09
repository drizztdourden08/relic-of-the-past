/* @layer electron-main @kind logic */
import type { HidDeviceInfo } from './sdl3.type';
import { loadAddon } from './load-addon';

const enumerateHid = (): HidDeviceInfo[] => {
  return loadAddon()?.enumerateHid() ?? [];
};

export { enumerateHid };
