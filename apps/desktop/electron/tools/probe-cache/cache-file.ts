/* @layer electron-main @kind logic */
import { getUserDataPath } from '@drizztdourden08/brock-electron/main';

const cacheFile = (): string => getUserDataPath('cache', 'audio-probe.json');

export { cacheFile };
