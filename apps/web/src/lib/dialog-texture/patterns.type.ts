/* @layer renderer-lib @kind types */
interface PatternSpec {
  pitchX: number;
  pitchY: number;
  brick: boolean;
  rows: boolean;
  draw: (ctx: CanvasRenderingContext2D, width: number) => void;
}

export type { PatternSpec };
