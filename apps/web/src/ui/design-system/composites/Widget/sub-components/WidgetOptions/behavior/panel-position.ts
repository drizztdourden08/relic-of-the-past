/* @layer renderer-components @kind logic */
/**
 * Where the options panel sits: under the gear button, right-aligned to it, and
 * clamped so it never hangs off a viewport edge. It flips above the button when
 * there is no room below.
 */
import { ANCHOR_GAP, EDGE_MARGIN, PANEL_HEIGHT, PANEL_WIDTH } from '../WidgetOptions.constants';
import type { AnchorRect } from '../WidgetOptions.type';

interface PanelPosition {
  top: number;
  left: number;
}

const panelPositionFor = (rect: AnchorRect, viewportW: number, viewportH: number): PanelPosition => {
  let top = rect.y + rect.height + ANCHOR_GAP;
  let left = rect.x + rect.width - PANEL_WIDTH;
  if (left < EDGE_MARGIN) left = EDGE_MARGIN;
  if (left + PANEL_WIDTH > viewportW - EDGE_MARGIN) left = viewportW - PANEL_WIDTH - EDGE_MARGIN;
  if (top + PANEL_HEIGHT > viewportH - EDGE_MARGIN) top = rect.y - PANEL_HEIGHT - ANCHOR_GAP;
  if (top < EDGE_MARGIN) top = EDGE_MARGIN;
  return { top, left };
};

export { panelPositionFor };
export type { PanelPosition };
