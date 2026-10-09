/* @layer electron-main @kind logic */
import { appendMainLog, appendMainLogSync } from '../../../lib/main-log-file';
import type { MainLogLevel } from '../../../lib/main-log-file';
import { TAG } from './forensics-log.constants';
import type { NoteOptions } from './forensics-log.type';
import { writeTerminal } from './write-terminal';

const note = (level: MainLogLevel, message: string, options: NoteOptions = {}): void => {
  const { sync = false, terminal = true } = options;
  const line = `${TAG} ${message}`;
  if (terminal) writeTerminal(level, line);
  if (sync) appendMainLogSync(level, line);
  else appendMainLog(level, line);
};

export { note };
