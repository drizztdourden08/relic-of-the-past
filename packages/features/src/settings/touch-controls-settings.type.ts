/* @layer shared-types @kind types */

/** The pad input a touch button sends, named after the SNES button it stands for. */
type TouchEmit =
  | 'a' | 'b' | 'x' | 'y' | 'l' | 'r' | 'start' | 'select'
  | 'up' | 'down' | 'left' | 'right'
  | 'l2' | 'r2' | 'l3' | 'r3';

/** A position as a fraction of the screen: 0..1 on each axis, top-left origin. */
interface TouchPoint {
  x: number;
  y: number;
}

/** An area as fractions of the screen. */
interface TouchRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

type TouchButtonShape = 'round' | 'pill';

interface TouchButton {
  id: string;
  emit: TouchEmit;
  label: string;
  /** Centre of the button. */
  at: TouchPoint;
  /** Size multiplier on the base size, 0.6..1.8. */
  scale: number;
  shape: TouchButtonShape;
  /** Group id, or null for a free button. */
  group: string | null;
}

interface TouchGroup {
  id: string;
  label: string;
  /** A locked group moves as one piece in edit mode. */
  locked: boolean;
}

/** The stick appears where the thumb lands inside the zone and follows it. */
interface DynamicStick {
  zone: TouchRect;
  scale: number;
  /** Fraction of the stick radius that sends nothing. */
  deadZone: number;
}

/** The stick stays at one spot. */
interface FixedStick {
  at: TouchPoint;
  scale: number;
  deadZone: number;
}

/** A fixed D-pad. Always fixed and never unlocked. */
interface TouchDpad {
  at: TouchPoint;
  scale: number;
}

type MovementType = 'dynamic-stick' | 'fixed-stick' | 'dpad';

/** Each movement type keeps its own spot, so switching back restores it. */
interface TouchMovements {
  'dynamic-stick': DynamicStick;
  'fixed-stick': FixedStick;
  dpad: TouchDpad;
}

interface OrientationLayout {
  movementType: MovementType;
  movements: TouchMovements;
  groups: TouchGroup[];
  buttons: TouchButton[];
}

type TouchOrientation = 'landscape' | 'portrait';

type SnapCell = 's' | 'm' | 'l';

interface TouchSnap {
  enabled: boolean;
  cell: SnapCell;
}

interface TouchControlsSettings {
  /** The touch overlay is drawn and sends input. Off means the original app with no overlay. */
  enabled: boolean;
  /** Hide the overlay while a physical pad is connected. */
  hideWithPad: boolean;
  /** Opacity of buttons, borders and labels, 0.1..1. */
  buttonStrength: number;
  /** Opacity of the layer behind the controls, 0..1. 0 is fully see-through. */
  layerOpacity: number;
  haptics: boolean;
  snap: TouchSnap;
  /** How long a hold on empty space takes to open the menu, in ms. */
  menuHoldMs: number;
  layouts: Record<TouchOrientation, OrientationLayout>;
}

export type {
  DynamicStick,
  FixedStick,
  MovementType,
  OrientationLayout,
  SnapCell,
  TouchButton,
  TouchButtonShape,
  TouchControlsSettings,
  TouchDpad,
  TouchEmit,
  TouchGroup,
  TouchMovements,
  TouchOrientation,
  TouchPoint,
  TouchRect,
  TouchSnap,
};
