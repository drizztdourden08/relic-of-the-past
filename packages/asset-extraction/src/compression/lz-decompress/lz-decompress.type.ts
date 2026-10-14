/* @layer shared-asset-extraction @kind types */
type GetByteFn = (addr: number) => number;

type ByteCursor = {
  next: () => number;
  consumed: () => number;
};

type CommandHeader = {
  cmd: number;
  count: number;
};

type CommandRun = {
  cmd: number;
  count: number;
  result: number[];
  cursor: ByteCursor;
  offsetIsBe: boolean;
};

export type { ByteCursor, CommandHeader, CommandRun, GetByteFn };
