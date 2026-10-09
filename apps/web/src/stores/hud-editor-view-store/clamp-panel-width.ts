/* @layer renderer-stores @kind logic */
import { PANEL_MAX_WIDTH, PANEL_MIN_WIDTH } from './hud-editor-view-store.constants';

const clampPanelWidth = (px: number): number =>
  Math.round(Math.min(Math.max(px, PANEL_MIN_WIDTH), PANEL_MAX_WIDTH));

export { clampPanelWidth };
