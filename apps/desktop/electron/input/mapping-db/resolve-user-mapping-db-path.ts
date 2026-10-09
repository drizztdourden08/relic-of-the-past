/* @layer electron-main @kind logic */
import { getUserDataRootPath } from '../../lib/paths';
import { DB_FILENAME } from './mapping-db.constants';

const resolveUserMappingDbPath = (): string => getUserDataRootPath(DB_FILENAME);

export { resolveUserMappingDbPath };
