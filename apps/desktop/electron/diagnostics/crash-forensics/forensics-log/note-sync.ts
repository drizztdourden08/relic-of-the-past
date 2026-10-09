/* @layer electron-main @kind logic */
import type { MainLogLevel } from '../../../lib/main-log-file';
import { note } from './note';

const noteSync = (level: MainLogLevel, message: string): void => note(level, message, { sync: true });

export { noteSync };
