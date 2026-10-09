/* @layer renderer-lib @kind logic */
import { subscribe } from '../../log-bus';
import { formatSessionLogLine } from './format-session-log-line';
import { createLogBatcher } from './log-batcher';
import { FLUSH_MS, MAX_BUFFERED_LINES } from './install-session-log-tap.constants';

const installSessionLogTap = (): void => {
  const appendSessionLog = window.api?.appendSessionLog;
  if (typeof appendSessionLog !== 'function') return;

  const send = (lines: string[]): void => {
    appendSessionLog(lines);
  };
  const batcher = createLogBatcher({ flushMs: FLUSH_MS, maxLines: MAX_BUFFERED_LINES, send });

  subscribe((entry) => batcher.push(formatSessionLogLine(entry)));
  window.addEventListener('pagehide', () => batcher.flush());
};

export { installSessionLogTap };
