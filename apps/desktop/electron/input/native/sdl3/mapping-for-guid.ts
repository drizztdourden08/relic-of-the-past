/* @layer electron-main @kind logic */
import { loadAddon } from './load-addon';

const mappingForGuid = (guid: string): string | null => {
  return loadAddon()?.mappingForGuid(guid) ?? null;
};

export { mappingForGuid };
