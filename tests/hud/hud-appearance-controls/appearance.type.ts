/* @layer tests @kind type */
interface Measured {
  case: string; kind: string; name: string;
  width: number; height: number; content: number; lines: number; overflow: number;
}

interface AppearanceRig {
  measured: Record<number, Measured[]>;
  at: (rail: number, kind: string, kase?: string) => Measured[];
  hex: (rail: number, kase: string, label: string) => number;
  close: () => Promise<void>;
}

export type { AppearanceRig, Measured };
