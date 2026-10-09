/* @layer electron-main @kind logic */
import { existsSync } from 'fs';
import { join } from 'path';
import { DB_FILENAME } from './mapping-db.constants';

const resolveBundledMappingDbPath = (): string | null => {
  const candidates = [
    ...(process.resourcesPath ? [join(process.resourcesPath, DB_FILENAME)] : []),
    join(__dirname, '..', '..', 'resources', DB_FILENAME),
  ];
  return candidates.find((candidate) => existsSync(candidate)) ?? null;
};

export { resolveBundledMappingDbPath };
