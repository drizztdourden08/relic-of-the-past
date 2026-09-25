/* @layer shared-hud @kind data */
/**
 * The shipped arrangements - as documents, read the way a player's own layout
 * is read.
 *
 * They are JSON, not code, so that "built-in" is a label on a file and
 * not a second authoring path. Each one is validated as this module loads: a
 * built-in that stopped being valid is a broken build, and the place to find
 * that out is the first import, not the first frame.
 *
 * They are the ONLY copy of the shipped arrangements. A second, flat copy in
 * code held the same three while the renderer still drew from five anchored
 * placements; phase 3 of `plans/hud-layout-engine.html` deleted it.
 */

import { loadLayout } from './load-layout';
import bottomRightJson from './built-in/bottom-right.json';
import compactJson from './built-in/compact.json';
import defaultJson from './built-in/default.json';
import type { HudLayout } from '../../types/hud/hud-layout';

const BUILT_IN_LAYOUTS: readonly HudLayout[] = [
  loadLayout(defaultJson, 'built-in/default.json'),
  loadLayout(compactJson, 'built-in/compact.json'),
  loadLayout(bottomRightJson, 'built-in/bottom-right.json'),
];

const DEFAULT_LAYOUT: HudLayout = BUILT_IN_LAYOUTS[0];

/** An id to a shipped document, or nothing. A caller that also serves custom
 *  layouts wants `resolveStoredDocument` in the renderer's layout store. */
const layoutById = (id: string): HudLayout | undefined =>
  BUILT_IN_LAYOUTS.find((doc) => doc.id === id);

export { BUILT_IN_LAYOUTS, DEFAULT_LAYOUT, layoutById };
