/* @layer shared-input @kind barrel */
export { DEFAULT_TOUCH_CONTROLS } from '../../touch/defaults/default-touch-controls.constants';
export {
  EMIT_TO_PAD_INDEX,
  SNAP_CELL_SIZE,
  TOUCH_BASE_SIZE,
  TOUCH_PAD_AXIS_COUNT,
  TOUCH_PAD_BUTTON_COUNT,
  TOUCH_PAD_KEY,
} from '../../touch/touch-emit.constants';
export { addButton } from '../../touch/editing/add-button';
export { emitLabel } from '../../touch/editing/emit-label';
export { moveButton } from '../../touch/editing/move-button';
export { moveMovement } from '../../touch/editing/move-movement';
export { removeButton } from '../../touch/editing/remove-button';
export { resizeZone } from '../../touch/editing/resize-zone';
export { setButtonEmit } from '../../touch/editing/set-button-emit';
export { setButtonScale } from '../../touch/editing/set-button-scale';
export { setButtonShape } from '../../touch/editing/set-button-shape';
export { setGroupLocked } from '../../touch/editing/set-group-locked';
export { setMovementScale } from '../../touch/editing/set-movement-scale';
export { setMovementType } from '../../touch/editing/set-movement-type';
export { basePx } from '../../touch/geometry/base-px';
export { buttonHitBox } from '../../touch/geometry/button-hit-box';
export type { ButtonHitBox } from '../../touch/geometry/button-hit-box.type';
export { clampPoint } from '../../touch/geometry/clamp-point';
export { clampRect } from '../../touch/geometry/clamp-rect';
export { movementRadiusPx } from '../../touch/geometry/movement-radius-px';
export { orientationOf } from '../../touch/geometry/orientation-of';
export { resolveTouchTarget } from '../../touch/geometry/resolve-touch-target';
export { snapPoint } from '../../touch/geometry/snap-point';
export { toFraction } from '../../touch/geometry/to-fraction';
export { toPx } from '../../touch/geometry/to-px';
export { readDpad } from '../../touch/movement/read-dpad';
export { readStick } from '../../touch/movement/read-stick';
export { buildPadState } from '../../touch/pad/build-pad-state';
export type {
  DpadReading,
  PadState,
  PxPoint,
  ScreenBox,
  StickReading,
  StickState,
  TouchTarget,
} from '../../touch/touch-logic.type';
