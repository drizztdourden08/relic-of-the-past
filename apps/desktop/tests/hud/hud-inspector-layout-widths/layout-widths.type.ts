/* @layer tests @kind type */
interface Measured {
  case: string; kind: string; name: string;
  width: number; height: number; content: number; lines: number; overflow: number; scroll: number;
}

interface LayoutRig {
  measured: Record<number, Measured[]>;
  at: (rail: number, kind: string, kase?: string) => Measured[];
  close: () => Promise<void>;
}

export type { LayoutRig, Measured };
