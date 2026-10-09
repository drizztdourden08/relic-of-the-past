/* @layer electron-main @kind logic */
import { getLegacyPath } from '@drizztdourden08/brock-electron/main';
import { DB_FILENAME } from './mapping-db.constants';

const resolveUserMappingDbPath = (): string => getLegacyPath(DB_FILENAME);

export { resolveUserMappingDbPath };
