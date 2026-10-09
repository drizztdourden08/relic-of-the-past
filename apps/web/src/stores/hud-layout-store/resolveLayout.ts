/* @layer renderer-stores @kind logic */
import { DEFAULT_LAYOUT, layoutById } from '@shared/hud/layouts';
import type { HudLayout } from '@shared/types/hud';

const resolveLayout = (id: string): HudLayout => layoutById(id) ?? DEFAULT_LAYOUT;

export { resolveLayout };
