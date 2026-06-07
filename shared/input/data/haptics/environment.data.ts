/* @layer shared-input @kind data */
/**
 * Environmental and pickup haptic patterns.
 */

import type { HapticPatternEntry } from './types';
import { pulse, crescendo, fadeOut } from './builders';

const ENVIRONMENT_PATTERNS = {

  // ─── Environmental ───

  fallIntoPit: {
    segments: pulse(150, 0.55),
    delayMs: 0,
    cooldownMs: 500,
  } as HapticPatternEntry,

  landFromLedge: {
    segments: pulse(40, 0.25),
    delayMs: 0,
    cooldownMs: 200,
  } as HapticPatternEntry,

  chestOpen: {
    segments: pulse(100, 0.50),
    delayMs: 50,
    cooldownMs: 500,
  } as HapticPatternEntry,

  bombExplode: {
    segments: pulse(150, 0.70),
    delayMs: 0,
    cooldownMs: 100,
  } as HapticPatternEntry,

  enterWater: {
    segments: pulse(40, 0.25),
    delayMs: 0,
    cooldownMs: 1000,
  } as HapticPatternEntry,

  mirrorWarp: {
    segments: crescendo(200, 0.55),
    delayMs: 0,
    cooldownMs: 2000,
  } as HapticPatternEntry,

  quakeEnvironment: {
    segments: crescendo(400, 1.0),
    delayMs: 0,
    cooldownMs: 500,
  } as HapticPatternEntry,

  bossDefeated: {
    segments: fadeOut(400, 0.90),
    delayMs: 100,
    cooldownMs: 5000,
  } as HapticPatternEntry,

  // ─── Pickups ───

  heartPiece: {
    segments: pulse(120, 0.50),
    delayMs: 50,
    cooldownMs: 1000,
  } as HapticPatternEntry,

  pendantCrystal: {
    segments: pulse(200, 0.70),
    delayMs: 100,
    cooldownMs: 5000,
  } as HapticPatternEntry,

  largeRupee: {
    segments: pulse(30, 0.15),
    delayMs: 0,
    cooldownMs: 200,
  } as HapticPatternEntry,

} as const;

export { ENVIRONMENT_PATTERNS };
