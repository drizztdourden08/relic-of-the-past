/* @layer renderer-lib @kind logic */
import type { LogBatcher, LogBatcherOptions } from './log-batcher.type';

const sendQuietly = (send: (lines: string[]) => void, batch: string[]): void => {
  try {
    send(batch);
  } catch {
    
  }
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
    sendQuietly(send, batch);
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
