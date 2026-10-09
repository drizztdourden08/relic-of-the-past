/* @layer renderer-stores @kind logic */
import { DEFAULT_LAYOUT, layoutById } from '@rotp/hud';
import type { HudLayout } from '@rotp/hud';

const resolveLayout = (id: string): HudLayout => layoutById(id) ?? DEFAULT_LAYOUT;

export { resolveLayout };
