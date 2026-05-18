/**
 * Controller registration entry point.
 * Import this file to populate the registry with all known controllers.
 * Order matters — specific controllers first, generic fallback last.
 */

// Specific controllers (matched by VID:PID)
import './impl/gamecube-wireless';
import './impl/switch-pro-2';
import './impl/switch-pro';
import './impl/xbox';
import './impl/playstation';
import './impl/8bitdo';

// Generic fallback (matches anything) — must be last
import './impl/generic';

// Re-export registry API for consumers
export { findController, findControllerById, getAllControllers } from './registry';
export { BaseController } from './base';
export type { ControllerContext, ParsedInput, VibrationSegment, StickDefaults, ControllerButton, ControllerAxis, ButtonCategory } from './base';
