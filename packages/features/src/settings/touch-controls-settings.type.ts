/* @layer shared-types @kind types */
import type { InputBinding } from '@rotp/game-data';

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

type TouchButtonShape = 'round' | 'pill';

interface TouchButton {
  id: string;
  emit: TouchEmit;
  label: string;
  at: TouchPoint;
  scale: number;
  shape: TouchButtonShape;
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

interface TouchBindings {
  classic: Readonly<Record<string, InputBinding>>;
  verbs: Readonly<Record<string, InputBinding>>;
  slots: Readonly<Record<number, InputBinding>>;
}

interface TouchControlsSettings {
  enabled: boolean;
  hideWithPad: boolean;
  buttonStrength: number;
  layerOpacity: number;
  haptics: boolean;
  hapticStrength: number;
  snap: TouchSnap;
  menuHoldMs: number;
  layouts: Record<TouchOrientation, OrientationLayout>;
  bindings: TouchBindings;
}

export type {
  DynamicStick,
  FixedStick,
  MovementType,
  OrientationLayout,
  SnapCell,
  TouchBindings,
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
