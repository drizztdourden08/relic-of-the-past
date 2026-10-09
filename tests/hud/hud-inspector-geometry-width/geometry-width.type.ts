/* @layer tests @kind type */
interface Measured {
  case: string; kind: string; name: string;
  width: number; height: number; content: number; lines: number; overflow: number;
}

interface GeometryRig {
  measured: Record<number, Measured[]>;
  heights: Record<number, Record<string, number>>;
  close: () => Promise<void>;
}

export type { GeometryRig, Measured };
