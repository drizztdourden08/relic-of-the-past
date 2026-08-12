/* @layer shared-input @kind data */
/**
 * Combat haptic patterns — sword, damage taken, dash.
 */

import type { HapticPatternEntry } from './types';
import { pulse, doubleTap, fadeOut } from './builders';

const COMBAT_PATTERNS = {

  // ─── Sword ───

  swordSwing: {
    segments: pulse(60, 0.35),
    delayMs: 0,
    cooldownMs: 0,
  } as HapticPatternEntry,

  swordSwingRapid: {
    segments: pulse(30, 0.20),
    delayMs: 0,
    cooldownMs: 0,
  } as HapticPatternEntry,

  swordHitEnemy: {
    segments: pulse(80, 0.50),
    delayMs: 0,
    cooldownMs: 60,
  } as HapticPatternEntry,

  swordClink: {
    segments: doubleTap(60, 0.25),
    gapMs: 15,
    delayMs: 0,
    cooldownMs: 100,
  } as HapticPatternEntry,

  spinAttackRelease: {
    segments: pulse(120, 0.70),
    delayMs: 0,
    cooldownMs: 300,
  } as HapticPatternEntry,

  // ─── Damage Taken (scaled by amount) ───

  damageLow: {
    segments: pulse(100, 0.40),
    delayMs: 0,
    cooldownMs: 200,
  } as HapticPatternEntry,

  damageMedium: {
    segments: pulse(150, 0.70),
    delayMs: 0,
    cooldownMs: 200,
  } as HapticPatternEntry,

  damageHigh: {
    segments: pulse(200, 1.0),
    delayMs: 0,
    cooldownMs: 200,
  } as HapticPatternEntry,

  death: {
    segments: fadeOut(500, 1.0),
    delayMs: 0,
    cooldownMs: 2000,
  } as HapticPatternEntry,

  // ─── Dash ───

  dashStep: {
    segments: pulse(20, 0.20),
    delayMs: 0,
    cooldownMs: 0,     // handled by polling interval instead
    minDurationExempt: true, // fires ~8/sec; stretching it would blur into one buzz
  } as HapticPatternEntry,

} as const;

export { COMBAT_PATTERNS };
