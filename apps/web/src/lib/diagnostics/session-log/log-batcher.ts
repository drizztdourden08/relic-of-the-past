/* @layer renderer-lib @kind logic */
/**
 * Line batcher for the session log: buffers pushed lines and hands them to
 * `send` as one batch: after `flushMs` of quiet, or immediately once
 * `maxLines` are buffered, so logging never costs one IPC round per line.
 * `send` failures are swallowed: the batcher must never throw into app code.
 */
type LogBatcherOptions = {
  flushMs: number;
  maxLines: number;
  send: (lines: string[]) => void;
};

type LogBatcher = {
  push: (line: string) => void;
  flush: () => void;
};

const createLogBatcher = (options: LogBatcherOptions): LogBatcher => {
  const { flushMs, maxLines, send } = options;
  let buffer: string[] = [];
  let timer: ReturnType<typeof setTimeout> | null = null;

  const flush = (): void => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
    if (buffer.length === 0) return;
    const batch = buffer;
    buffer = [];
    try {
      send(batch);
    } catch {
      // Best-effort: a failed flush drops the batch, never the app.
    }
  };

  const push = (line: string): void => {
    buffer.push(line);
    if (buffer.length >= maxLines) {
      flush();
      return;
    }
    if (timer === null) {
      timer = setTimeout(flush, flushMs);
    }
  };

  return { push, flush };
};

export { createLogBatcher };
export type { LogBatcher, LogBatcherOptions };
