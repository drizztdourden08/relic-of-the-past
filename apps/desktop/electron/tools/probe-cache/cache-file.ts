/* @layer electron-main @kind logic */
import { getUserDataPath } from '../../lib/paths';

const cacheFile = (): string => getUserDataPath('cache', 'audio-probe.json');

export { cacheFile };
