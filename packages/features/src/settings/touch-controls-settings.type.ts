/* @layer shared-types @kind types */
type TouchEmit =
  | 'a' | 'b' | 'x' | 'y' | 'l' | 'r' | 'start' | 'select'
  | 'up' | 'down' | 'left' | 'right'
  | 'l2' | 'r2' | 'l3' | 'r3';

interface TouchPoint {
  x: number;
  y: number;
}

interface TouchRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface TouchButtonForm {
  width: number;
  height: number;
  radius: number;
}

interface TouchButton extends TouchButtonForm {
  id: string;
  emit: TouchEmit;
  label: string;
  at: TouchPoint;
  scale: number;
  group: string | null;
}

interface TouchGroup {
  id: string;
  label: string;
  locked: boolean;
}

interface DynamicStick {
  zone: TouchRect;
  scale: number;
  deadZone: number;
}

interface FixedStick {
  at: TouchPoint;
  scale: number;
  deadZone: number;
}

interface TouchDpad {
  at: TouchPoint;
  scale: number;
}

type MovementType = 'dynamic-stick' | 'fixed-stick' | 'dpad';

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
  buttonStrength: number;
  layerOpacity: number;
  haptics: boolean;
  hapticStrength: number;
  snap: TouchSnap;
  editHoldMs: number;
  layouts: Record<TouchOrientation, OrientationLayout>;
}

export type {
  DynamicStick,
  FixedStick,
  MovementType,
  OrientationLayout,
  SnapCell,
  TouchButton,
  TouchButtonForm,
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
