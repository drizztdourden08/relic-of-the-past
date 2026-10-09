/* @layer electron-main @kind logic */
import { on } from '../../lib/ipc/handle';
import { appendBatch } from './append-batch';

const registerSessionLogHandler = (): void => {
  on('debug:appendSessionLog', (_event, lines) => {
    if (!Array.isArray(lines)) return;
    appendBatch(lines.filter((line): line is string => typeof line === 'string'));
  });
};

export { registerSessionLogHandler };
