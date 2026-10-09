/* @layer electron-main @kind logic */
import { loadAddon } from './load-addon';

const addMappingsFromFile = (path: string): number => {
  return loadAddon()?.addMappingsFromFile(path) ?? 0;
};

export { addMappingsFromFile };
