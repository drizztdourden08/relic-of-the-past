/* @layer shared-input @kind types */

interface ScreenBox {
  width: number;
  height: number;
}

interface PxPoint {
  x: number;
  y: number;
}

type TouchTarget =
  | { kind: 'button'; id: string }
  | { kind: 'movement' }
  | { kind: 'empty' };

interface StickState {
  base: PxPoint;
  thumb: PxPoint;
}

interface StickReading {
  axes: [number, number];
  base: PxPoint;
}

interface DpadReading {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
}

interface PadState {
  buttons: boolean[];
  axes: number[];
}

export type { DpadReading, PadState, PxPoint, ScreenBox, StickReading, StickState, TouchTarget };
