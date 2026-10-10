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

type TransitionSettledArgs = [
  module: number, fromSubmodule: number, indoors: number, roomIndex: number, owScreenIndex: number,
];

export type { TransitionKind, TransitionSettled, TransitionListener, TransitionSettledArgs };
