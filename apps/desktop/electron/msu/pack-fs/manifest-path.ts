/* @layer electron-main @kind logic */
import { join } from 'path';
import { MSUL_MANIFEST_NAME } from '@rotp/hub-contracts';
import { packPath } from './pack-path';

const manifestPath = (pack: string): string => join(packPath(pack), MSUL_MANIFEST_NAME);

export { manifestPath };
