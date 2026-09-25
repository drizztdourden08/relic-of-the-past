/* @layer shared-hud @kind barrel */
export { HUD_EDGE_INSET, PAUSE_LEGEND_HEIGHT, PAUSE_LEGEND_LEFT_RESERVE } from './chrome-reserve';
export {
  CONSUMABLES_SIZE, DEFAULT_HEARTS, HEARTS_PER_ROW, HEART_SIZE, LIFE_SIZE,
  MAGIC_FRAME, MAGIC_SIZE, WALLET_SIZE, lifeSize,
} from './element-sizes';
export { REFERENCE_VIEW, VITALS_RESERVE, vitalsReserve } from './vitals-reserve';
export type { Rect, Size } from './geometry.type';
export { BUILT_IN_LAYOUTS, DEFAULT_LAYOUT, layoutById } from './built-in-layouts';
export { editGridTracks, reachOn, tracksOn } from './grid-track-edits';
export type { TrackAxis, TrackEdit } from './grid-track-edits';
export { DEVICE_LAYOUTS, defaultLayoutIdFor } from './device-layout';
export type { LayoutDeviceKind } from './device-layout';
export { failureMessage, loadLayout, tryLoadLayout } from './load-layout';
export type { LoadResult } from './load-layout';
export { MAX_EXPANDED_NODES, worstCaseNodeCount } from './validate-expand-budget';
export { validateLayout, validateValue } from './validate-layout';
export type { ValidationResult } from './validate-layout';
export type { ValueContext } from './validate-value';
export { validateStyle } from './validate-style';
export { validateAnimations, validateTransition } from './validate-motion';
export { collectReflowWarnings, isOverlay } from './validate-motion-warnings';
