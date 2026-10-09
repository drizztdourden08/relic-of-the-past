/* @layer electron-main @kind logic */
import { join } from 'path';
import { packPath } from './pack-path';
import { safeName } from './safe-name';

const packFilePath = (pack: string, fileName: string): string =>
  join(packPath(pack), safeName(fileName));

export { packFilePath };
