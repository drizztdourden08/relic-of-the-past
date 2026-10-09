/* @layer electron-main @kind logic */
import { getUserDataPath } from '../../lib/paths';
import { safeName } from './safe-name';

const packPath = (pack: string): string => getUserDataPath('msu', safeName(pack));

export { packPath };
