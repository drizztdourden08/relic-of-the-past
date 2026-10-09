/* @layer renderer-components @kind constants */
import type { HudBorderStyle } from '@rotp/hud';

const BORDER_STYLES: readonly HudBorderStyle[] = ['solid', 'dashed', 'dotted'];
const MAX_OUTLINE_PX = 2;
const CORNERS = ['TL', 'TR', 'BR', 'BL'] as const;

export { BORDER_STYLES, CORNERS, MAX_OUTLINE_PX };
