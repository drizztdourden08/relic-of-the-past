/* @layer renderer-components @kind types */
interface Run {
  sum: number;
  count: number;
  top: number;
}

interface SpreadBounds {
  min: number;
  max: number;
  lineH: number;
  minLineH: number;
}

export type { Run, SpreadBounds };
