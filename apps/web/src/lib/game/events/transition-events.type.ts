/* @layer bridge-wasm @kind types */
type TransitionKind = 'room' | 'quadrant' | 'doors' | 'stairs' | 'entered' | 'other';

interface TransitionSettled {
  kind: TransitionKind;
  module: number;
  fromSubmodule: number;
  isIndoors: boolean;
  roomIndex: number;
  owScreenIndex: number;
}

type TransitionListener = (event: TransitionSettled) => void;

export type { TransitionKind, TransitionSettled, TransitionListener };
