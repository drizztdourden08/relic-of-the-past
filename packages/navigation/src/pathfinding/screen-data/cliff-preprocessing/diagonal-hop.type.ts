/* @layer shared-game @kind types */
interface DiagonalHop {
  dh: -1 | 1;
  row: number;
  col: number;
  steps: number;
  solid: boolean;
}

export type { DiagonalHop };
