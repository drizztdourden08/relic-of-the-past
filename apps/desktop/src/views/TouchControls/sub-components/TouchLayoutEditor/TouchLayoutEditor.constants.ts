/* @layer renderer-app @kind constants */
import type { MovementType, TouchButtonShape, TouchEmit } from '@rotp/features';

const EDITOR_MIN_STRENGTH = 0.6;

const DRAG_THRESHOLD_PX = 6;

const GROUP_FRAME_PAD_PX = 8;

const MIN_HIT_PX = 44;

const RESIZE_HANDLE_PX = 32;

const BUTTON_SCALE_RANGE = { min: 0.6, max: 1.8, step: 0.05 } as const;
const MOVEMENT_SCALE_RANGE = { min: 0.8, max: 2.2, step: 0.05 } as const;
const STRENGTH_RANGE = { min: 0.1, max: 1, step: 0.05 } as const;
const HOLD_SECONDS_RANGE = { min: 1, max: 5, step: 0.5 } as const;

const ADD_AT = { x: 0.5, y: 0.5 } as const;

const ALL_EMITS: readonly TouchEmit[] = [
  'a', 'b', 'x', 'y', 'l', 'r', 'start', 'select',
  'up', 'down', 'left', 'right', 'l2', 'r2', 'l3', 'r3',
];

const MOVEMENT_OPTIONS: { value: MovementType; label: string }[] = [
  { value: 'dynamic-stick', label: 'Dynamic stick' },
  { value: 'fixed-stick', label: 'Fixed stick' },
  { value: 'dpad', label: 'D-pad' },
];

const SHAPE_OPTIONS: { value: TouchButtonShape; label: string }[] = [
  { value: 'round', label: 'Round' },
  { value: 'pill', label: 'Pill' },
];

const CELL_OPTIONS = [
  { value: 's', label: 'S' },
  { value: 'm', label: 'M' },
  { value: 'l', label: 'L' },
] as const;

export {
  ADD_AT,
  ALL_EMITS,
  BUTTON_SCALE_RANGE,
  CELL_OPTIONS,
  DRAG_THRESHOLD_PX,
  EDITOR_MIN_STRENGTH,
  GROUP_FRAME_PAD_PX,
  HOLD_SECONDS_RANGE,
  MIN_HIT_PX,
  MOVEMENT_OPTIONS,
  MOVEMENT_SCALE_RANGE,
  RESIZE_HANDLE_PX,
  SHAPE_OPTIONS,
  STRENGTH_RANGE,
};
