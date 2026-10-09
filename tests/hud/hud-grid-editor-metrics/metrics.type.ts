/* @layer tests @kind type */
interface Cells { case: string; column: number; row: number; x: number; y: number; width: number; height: number }

interface Heads {
  case: string; axis: string; index: number; empty: boolean;
  x: number; y: number; width: number; height: number;
}

interface Scroller { case: string; scrollW: number; clientW: number; scrollH: number; clientH: number }

interface Frozen { rowHeadOffset: number; colHeadOffset: number; sticky: string }

interface Read {
  cells: Cells[];
  heads: Heads[];
  scroll: Scroller[];
  paint: Record<string, string>;
  frozen: { before: Frozen; after: Frozen };
  echo: { x: number; y: number; w: number; h: number } | null;
}

interface MetricsRig {
  read: Record<number, Read>;
  cellsOf: (rail: number, kase: string) => Cells[];
  cellAt: (rail: number, kase: string, column: number, row: number) => Cells;
  close: () => Promise<void>;
}

export type { Cells, Frozen, Heads, MetricsRig, Read, Scroller };
