/* @layer electron-main @kind logic */
import { appendFile } from 'fs/promises';
import { sessionLogPaths } from './session-log-paths';

let pendingWrite: Promise<void> = Promise.resolve();

const appendBatch = (lines: string[]): void => {
  if (lines.length === 0) return;
  const chunk = `${lines.join('\n')}\n`;
  pendingWrite = pendingWrite
    .then(() => appendFile(sessionLogPaths.current(), chunk, 'utf-8'))
    .catch(() => {});
};

export { appendBatch };
