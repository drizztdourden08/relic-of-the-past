/* @layer shared-hud @kind logic */
import { BUILT_IN_LAYOUTS } from './built-in-layouts.constants';
import type { HudLayout } from '../../types/hud-layout';

const layoutById = (id: string): HudLayout | undefined =>
  BUILT_IN_LAYOUTS.find((doc) => doc.id === id);

export { layoutById };
