/* @layer shared-input @kind logic */
/**
 * Controller registration entry point.
 * Import this file to populate the registry with all known controllers.
 * Order matters — specific controllers first, generic fallback last.
 */

// Specific controllers (matched by VID:PID)
import './data/presets/gamecube-wireless';
import './data/presets/switch-pro-2';
import './data/presets/switch-pro';
import './data/presets/xbox';
import './data/presets/playstation';
import './data/presets/8bitdo';

// Keyboard
import './data/presets/keyboard';

// Generic fallback (matches anything) — must be last
import './data/presets/generic';

// Re-export registry API for consumers
export { findController, findControllerById, getAllControllers } from './registry';
export { BaseController } from './base';
export type { ControllerContext, ParsedInput, VibrationSegment, StickDefaults, ControllerButton, ControllerAxis, ButtonCategory } from './base';
