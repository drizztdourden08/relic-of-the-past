/**
 * Controller registration entry point.
 * Import this file to populate the registry with all known controllers.
 * Order matters — specific controllers first, generic fallback last.
 */

// Specific controllers (matched by VID:PID)
import './presets/gamecube-wireless';
import './presets/switch-pro-2';
import './presets/switch-pro';
import './presets/xbox';
import './presets/playstation';
import './presets/8bitdo';

// Keyboard
import './presets/keyboard';

// Generic fallback (matches anything) — must be last
import './presets/generic';

// Re-export registry API for consumers
export { findController, findControllerById, getAllControllers } from './registry';
export { BaseController } from './base';
export type { ControllerContext, ParsedInput, VibrationSegment, StickDefaults, ControllerButton, ControllerAxis, ButtonCategory } from './base';
