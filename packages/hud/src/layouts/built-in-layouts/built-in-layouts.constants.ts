/* @layer shared-hud @kind constants */
import { loadLayout } from '../load-layout';
import { BUILT_IN_SOURCES } from './built-in-sources.constants';
import type { HudLayout } from '../../types/hud-layout';

const [defaultSource, ...otherSources] = BUILT_IN_SOURCES;

const DEFAULT_LAYOUT: HudLayout = loadLayout(defaultSource.json, defaultSource.source);

const BUILT_IN_LAYOUTS: readonly HudLayout[] = [
  DEFAULT_LAYOUT,
  ...otherSources.map(({ json, source }) => loadLayout(json, source)),
];

export { BUILT_IN_LAYOUTS, DEFAULT_LAYOUT };
