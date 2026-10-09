/* @layer renderer-lib @kind types */
interface AnimationState {
  offsetX: number;
  offsetY: number;
  fieldAlpha: number;
  cellAlpha: (row: number, col: number) => number;
}

export type { AnimationState };
