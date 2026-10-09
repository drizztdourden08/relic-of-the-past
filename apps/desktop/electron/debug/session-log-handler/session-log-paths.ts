/* @layer electron-main @kind logic */
import { getUserDataPath } from '../../lib/paths';

const sessionLogPaths = {
  current: (): string => getUserDataPath('debug', 'session.log'),
  previous: (): string => getUserDataPath('debug', 'session-1.log'),
};

export { sessionLogPaths };
