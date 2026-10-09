/* @layer shared-hud @kind constants */
import { loadLayout } from '../load-layout';
import { BUILT_IN_SOURCES } from './built-in-layouts.data';
import type { HudLayout } from '../../../types/hud/hud-layout';

const BUILT_IN_LAYOUTS: readonly HudLayout[] = BUILT_IN_SOURCES.map(({ json, source }) => loadLayout(json, source));

const DEFAULT_LAYOUT: HudLayout = BUILT_IN_LAYOUTS[0];

export { BUILT_IN_LAYOUTS, DEFAULT_LAYOUT };
