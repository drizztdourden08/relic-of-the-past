/* @layer shared-store @kind types */
type RangeReader = {
  bytes: number;
  range: (start: number, length: number) => Promise<Uint8Array>;
};

export type { RangeReader };
