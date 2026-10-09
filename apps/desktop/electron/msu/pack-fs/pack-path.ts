/* @layer electron-main @kind logic */
import { getUserDataPath } from '@drizztdourden08/brock-electron/main';
import { safeName } from './safe-name';

const packPath = (pack: string): string => getUserDataPath('msu', safeName(pack));

export { packPath };
