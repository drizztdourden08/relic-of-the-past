/* @layer renderer-lib @kind logic */
/**
 * Taps the log-bus at emit time (so lines the ring buffer later evicts still
 * reach disk) and streams every entry, batched, to the main process's
 * Data/debug/session.log sink. Installed once at renderer boot, on every
 * launch. This is the after-the-fact debugging surface for live sessions.
 */
import { subscribe } from '../../log-bus';
import { formatSessionLogLine } from './format-session-log-line';
import { createLogBatcher } from './log-batcher';

const FLUSH_MS = 1000;
const MAX_BUFFERED_LINES = 200;

const installSessionLogTap = (): void => {
  // Guarded lookup: a non-Electron host's shim makes this a no-op send, and a
  // preload predating the channel leaves the tap uninstalled.
  const appendSessionLog = window.api?.appendSessionLog;
  if (typeof appendSessionLog !== 'function') return;

  const send = (lines: string[]): void => {
    appendSessionLog(lines);
  };
  const batcher = createLogBatcher({ flushMs: FLUSH_MS, maxLines: MAX_BUFFERED_LINES, send });

  subscribe((entry) => batcher.push(formatSessionLogLine(entry)));
  // Last-gasp flush so the tail of a session isn't lost on close/reload.
  window.addEventListener('pagehide', () => batcher.flush());
};

export { installSessionLogTap };
