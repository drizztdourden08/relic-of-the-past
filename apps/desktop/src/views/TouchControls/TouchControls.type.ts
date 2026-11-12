/* @layer renderer-app @kind types */
import type { DpadReading, PxPoint } from '@rotp/input-mapping';

/** What one finger is doing. A finger keeps the target it landed on until it lifts. */
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

/** What the overlay draws from the fingers on it. */
interface TouchViewState {
  pressed: ReadonlySet<string>;
  stick: StickView | null;
  dpad: DpadReading;
}

interface HoldRingState {
  center: PxPoint;
  progress: number;
}

interface MenuHold {
  ring: HoldRingState | null;
  begin: (pointerId: number, point: PxPoint) => void;
  move: (pointerId: number, point: PxPoint) => void;
  end: (pointerId: number) => void;
  cancel: () => void;
}

export type { HoldRingState, MenuHold, StickView, TouchSession, TouchViewState };
