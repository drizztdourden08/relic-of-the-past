/* @layer renderer-app @kind types */
import type { DpadReading, PxPoint } from '@rotp/input-mapping';

type TouchSession = { point: PxPoint } & (
  | { kind: 'button'; buttonId: string | null }
  | { kind: 'movement'; base: PxPoint }
  | { kind: 'empty' }
  | { kind: 'ignored' }
);

interface StickView {
  base: PxPoint;
  knob: PxPoint;
}

interface TouchViewState {
  pressed: ReadonlySet<string>;
  stick: StickView | null;
  dpad: DpadReading;
}

interface HoldRingState {
  center: PxPoint;
  progress: number;
}

interface EditHold {
  ring: HoldRingState | null;
  begin: (pointerId: number, point: PxPoint) => void;
  move: (pointerId: number, point: PxPoint) => void;
  end: (pointerId: number) => void;
  cancel: () => void;
}

export type { EditHold, HoldRingState, TouchSession, TouchViewState };
