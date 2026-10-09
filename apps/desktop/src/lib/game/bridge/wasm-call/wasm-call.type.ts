/* @layer bridge-wasm @kind types */
interface TableLayout {
  countBytes: 1 | 2;
  dataStart: number;
  stride: number;
  maxCount?: number;
}

interface CallArgs {
  argTypes: string[];
  args: unknown[];
}

type RowDecoder<T> = (heap: Uint8Array, off: number, index: number) => T;

export type { TableLayout, CallArgs, RowDecoder };
