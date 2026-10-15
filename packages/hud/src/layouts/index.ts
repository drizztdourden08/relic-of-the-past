/* @layer shared-hud @kind barrel */
export { HUD_EDGE_INSET, PAUSE_LEGEND_HEIGHT, PAUSE_LEGEND_LEFT_RESERVE } from './chrome-reserve.constants';
export {
  COUNTDOWN_SIZE,
} from './element-sizes';
export { VITALS_RESERVE } from './vitals-reserve';
export type { Rect, Size } from './geometry.type';
export { BUILT_IN_LAYOUTS, DEFAULT_LAYOUT, layoutById } from './built-in-layouts';
export { editGridTracks } from './grid-track-edits';
export type { TrackEdit } from './grid-track-edits';
export { defaultLayoutIdFor } from './device-layout';
export { loadLayout, tryLoadLayout } from './load-layout';
export { MAX_EXPANDED_NODES } from '../data/expand-limits.constants';
export { worstCaseNodeCount } from './validate-expand-budget';
export { validateLayout } from './validate-layout';
export { validateValue } from './validate-value';
export { collectReflowWarnings, isOverlay } from './validate-motion-warnings';
