/* @layer electron-main @kind logic */
import { existsSync } from 'fs';
import { addMappingsFromFile } from '../native/sdl3';
import { resolveBundledMappingDbPath } from './resolve-bundled-mapping-db-path';
import { resolveUserMappingDbPath } from './resolve-user-mapping-db-path';

const loadMappingDatabases = (): void => {
  const bundledPath = resolveBundledMappingDbPath();
  if (bundledPath) {
    addMappingsFromFile(bundledPath);
    console.log(`[controllers] registered bundled mapping db: ${bundledPath}`);
  } else {
    console.log('[controllers] no bundled mapping db found');
  }

  const userPath = resolveUserMappingDbPath();
  if (existsSync(userPath)) {
    addMappingsFromFile(userPath);
    console.log(`[controllers] registered user mapping db: ${userPath}`);
  }
};

export { loadMappingDatabases };
