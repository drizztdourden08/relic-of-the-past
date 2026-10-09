/* @layer electron-main @kind logic */
import { loadAddon } from './load-addon';

const addMapping = (mappingString: string): boolean => {
  return loadAddon()?.addMapping(mappingString) ?? false;
};

export { addMapping };
