/* @layer renderer-components @kind types */
/** The one tile the inspector is describing, as the tooltip needs it. */
interface TooltipData {
  x: number; y: number;
  row: number; col: number;
  attr: number; label: string;
  type: string; req: string | null;
  canPass: boolean | null;
  reachable: number;
  hookTarget: boolean;
  pathReqs: string;
  bfsBlocked: boolean;
  spriteInfo: string[];
  layer0Attr?: number;
  layer1Attr?: number;
  layer0Reach?: boolean;
  layer1Reach?: boolean;
}

export type { TooltipData };
