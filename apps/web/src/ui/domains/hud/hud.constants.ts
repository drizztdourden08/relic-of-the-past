/* @layer renderer-hud @kind constants */
import type { UIMode } from '@shared/game/types';

const MAIN_HUD_MODES = new Set<UIMode>(['gameplay', 'text', 'paused_menu']);

export { MAIN_HUD_MODES };
