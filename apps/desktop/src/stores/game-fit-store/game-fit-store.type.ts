/* @layer renderer-stores @kind types */
interface GameFitState {
  width: number;
  height: number;
  set: (width: number, height: number) => void;
}

export type { GameFitState };
