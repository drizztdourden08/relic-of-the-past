/* @layer electron-main @kind logic */
import { loadAddon } from './load-addon';

const version = (): string | null => {
  return loadAddon()?.version() ?? null;
};

export { version };
