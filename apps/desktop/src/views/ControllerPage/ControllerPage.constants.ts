/* @layer renderer-components @kind constants */
import type { RumbleTest } from './ControllerPage.type';

const PULSE_100 = { durationMs: 100, intensity: 1.0 };
const PULSE_1000 = { durationMs: 1000, intensity: 1.0 };

const RUMBLE_TESTS: readonly RumbleTest[] = [
  { label: '100ms', steps: [PULSE_100], gapMs: 0 },
  { label: '250ms', steps: [{ durationMs: 250, intensity: 1.0 }], gapMs: 0 },
  { label: '1000ms', steps: [PULSE_1000], gapMs: 0 },
  { label: '3×100ms', steps: [PULSE_100, PULSE_100, PULSE_100], gapMs: 50 },
  { label: '2-long-2', steps: [PULSE_100, PULSE_100, PULSE_1000, PULSE_100, PULSE_100], gapMs: 50 },
  { label: 'Sword Hit', hapticPattern: 'swordHitEnemy' },
];

const IDLE_BUTTON_SLOTS = 32;
const IDLE_AXIS_SLOTS = 6;

const FALLBACK_GLYPH = 'generic-btn';

const NO_RUMBLE_REASON = 'This controller reports no rumble.';
const UNMAPPED_REASON = 'No input until the controller is mapped.';

export { FALLBACK_GLYPH, IDLE_AXIS_SLOTS, IDLE_BUTTON_SLOTS, NO_RUMBLE_REASON, RUMBLE_TESTS, UNMAPPED_REASON };
