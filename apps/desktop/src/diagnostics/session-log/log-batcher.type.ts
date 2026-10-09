/* @layer renderer-lib @kind types */
type LogBatcherOptions = {
  flushMs: number;
  maxLines: number;
  send: (lines: string[]) => void;
};

type LogBatcher = {
  push: (line: string) => void;
  flush: () => void;
};

export type { LogBatcher, LogBatcherOptions };
