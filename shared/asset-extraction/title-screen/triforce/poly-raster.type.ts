/* @layer shared-asset-extraction @kind types */
interface Edge { cur: number; y: number; trig: number; target: number; frac: number; step: number; idx: number }

interface Raster {
  ram: Uint8Array;
  xy: number[];
  steps: number;
  dst: number;
  color: [number, number];
  left: Edge;
  right: Edge;
}

export type { Edge, Raster };
