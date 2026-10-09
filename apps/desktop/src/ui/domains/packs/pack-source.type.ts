/* @layer renderer-components @kind types */
type PackSource = {
  bytes: number;
  range: (start: number, length: number) => Promise<Uint8Array>;
};

export type { PackSource };
