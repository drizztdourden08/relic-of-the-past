/* @layer renderer-hud @kind logic */
/** Which game modes the main HUD overlay should be present in. */
import type { UIMode } from '@shared/game/types';

// Show during active gameplay and dialogue (the native HUD shows here too).
// 'paused_menu' is kept so the open/close slide can animate the HUD off-screen.
// Everything else (intro/title, loading, full-screen maps, flute/save menus,
// game over) hides the overlay entirely.
const MAIN_HUD_MODES = new Set<UIMode>(['gameplay', 'text', 'paused_menu']);

const isMainHudVisibleForMode = (mode: UIMode): boolean => MAIN_HUD_MODES.has(mode);

export { isMainHudVisibleForMode, MAIN_HUD_MODES };
