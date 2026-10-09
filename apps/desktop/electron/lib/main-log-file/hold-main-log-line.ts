/* @layer electron-main @kind logic */
import { PENDING_CAP } from './main-log-file.constants';
import { mainLogState } from './main-log-state';

const holdMainLogLine = (line: string): void => {
  if (mainLogState.pending.length < PENDING_CAP) mainLogState.pending.push(line);
};

export { holdMainLogLine };
