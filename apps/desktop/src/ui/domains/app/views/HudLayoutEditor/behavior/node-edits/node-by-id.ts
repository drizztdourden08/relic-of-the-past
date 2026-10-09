/* @layer renderer-components @kind logic */
import { siteOf } from './site-of';
import type { HudLayout, HudNode } from '@shared/types/hud';

const nodeById = (doc: HudLayout, id: string): HudNode | null => siteOf(doc, id)?.node ?? null;

export { nodeById };
