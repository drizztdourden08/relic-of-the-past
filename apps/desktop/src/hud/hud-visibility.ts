/* @layer renderer-hud @kind logic */
import type { UIMode } from '@rotp/game-data';
import { MAIN_HUD_MODES } from './hud.constants';

const isMainHudVisibleForMode = (mode: UIMode): boolean => MAIN_HUD_MODES.has(mode);

export { isMainHudVisibleForMode };
