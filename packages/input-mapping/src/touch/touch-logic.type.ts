/* @layer shared-input @kind types */

/** The overlay's size in CSS pixels. */
interface ScreenBox {
  width: number;
  height: number;
}

/** A position in CSS pixels inside the overlay, top-left origin. */
interface PxPoint {
  x: number;
  y: number;
}

/** What a touch landed on. Buttons win over the movement area, so a button inside the stick zone never starts the stick. */
type TouchTarget =
  | { kind: 'button'; id: string }
  | { kind: 'movement' }
  | { kind: 'empty' };

/** A stick in use: where its base sits and where the thumb is, in px. */
interface StickState {
  base: PxPoint;
  thumb: PxPoint;
}

/** The result of reading a stick: axes in -1..1 (y down is positive) and the base after the leash. */
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

/** The virtual pad published to the input manager: 16 W3C buttons and 4 axes. */
interface PadState {
  buttons: boolean[];
  axes: number[];
}

export type { DpadReading, PadState, PxPoint, ScreenBox, StickReading, StickState, TouchTarget };
