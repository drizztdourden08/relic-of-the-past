/* @layer electron-main @kind logic */
import { loadAddon } from './load-addon';

const rumble = (id: number, low: number, high: number, durationMs: number): boolean => {
  return loadAddon()?.rumble(id, low, high, durationMs) ?? false;
};

export { rumble };
