/**
 * Haptic Pattern Configuration
 *
 * Central configuration for all vibration patterns in the game.
 * Edit this file to tune timing, intensity, and feel of controller feedback.
 *
 * ─── Pattern Format ───
 * Each entry defines:
 *   segments   - Array of { durationMs, intensity } pulses sent to the motor
 *                intensity: 0.0 (off) to 1.0 (max)
 *   gapMs      - Pause between segments (default: 0)
 *   delayMs    - Delay before playing, for syncing with animation/sound (default: 0)
 *   cooldownMs - Minimum time between triggers; prevents rapid-fire spam (default: 0)
 *
 * ─── Intensity Guide ───
 *   0.10–0.20  Very faint — barely noticeable ambient feedback
 *   0.20–0.35  Faint — subtle confirmation (footsteps, small clicks)
 *   0.35–0.55  Medium — standard action feedback (sword swing, item use)
 *   0.55–0.75  Strong — impactful hits (damage, hammer, explosions)
 *   0.75–1.00  Heavy — maximum force (death, boss defeat, quake)
 *
 * The global "intensity" slider (0–100) in settings scales all values uniformly.
 */

import type { VibrationSegment } from './base';

// ─── Types ───

export interface HapticPatternEntry {
  /** Vibration segments: array of { durationMs, intensity } */
  segments: VibrationSegment[];
  /** Gap in ms between segments when played sequentially (default: 0) */
  gapMs?: number;
  /** Delay in ms before the pattern starts, for animation/sound sync (default: 0) */
  delayMs?: number;
  /** Minimum ms between repeated triggers of this event (debounce). 0 = no limit. */
  cooldownMs?: number;
}

// ─── Helper Builders ───

function pulse(durationMs: number, intensity: number): VibrationSegment[] {
  return [{ durationMs, intensity }];
}

function doubleTap(durationMs: number, intensity: number): VibrationSegment[] {
  const half = Math.floor(durationMs / 2);
  return [{ durationMs: half, intensity }, { durationMs: half, intensity }];
}

function crescendo(durationMs: number, maxIntensity: number, steps = 4): VibrationSegment[] {
  const stepDuration = Math.floor(durationMs / steps);
  return Array.from({ length: steps }, (_, i) => ({
    durationMs: stepDuration,
    intensity: (maxIntensity / steps) * (i + 1),
  }));
}

function fadeOut(durationMs: number, startIntensity: number, steps = 4): VibrationSegment[] {
  const stepDuration = Math.floor(durationMs / steps);
  return Array.from({ length: steps }, (_, i) => ({
    durationMs: stepDuration,
    intensity: startIntensity * (1 - i / steps),
  }));
}

// ═══════════════════════════════════════════════════════════════════════════════
// PATTERN DEFINITIONS — Edit these to tune vibration feel
// ═══════════════════════════════════════════════════════════════════════════════

export const HAPTIC_PATTERNS = {

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
  } as HapticPatternEntry,

  // ─── Items ───

  itemBow: {
    segments: pulse(40, 0.20),
    delayMs: 20,
    cooldownMs: 150,
  } as HapticPatternEntry,

  itemBomb: {
    segments: pulse(150, 0.70),
    delayMs: 0,
    cooldownMs: 100,
  } as HapticPatternEntry,

  itemHookshot: {
    segments: pulse(60, 0.50),
    delayMs: 0,
    cooldownMs: 200,
  } as HapticPatternEntry,

  itemHookshotWall: {
    segments: pulse(50, 0.35),
    delayMs: 0,
    cooldownMs: 200,
  } as HapticPatternEntry,

  itemHammer: {
    segments: pulse(100, 0.70),
    delayMs: 20,
    cooldownMs: 150,
  } as HapticPatternEntry,

  itemFireRod: {
    segments: pulse(50, 0.50),
    delayMs: 0,
    cooldownMs: 100,
  } as HapticPatternEntry,

  itemIceRod: {
    segments: [{ durationMs: 50, intensity: 0.50 }, { durationMs: 30, intensity: 0.30 }],
    delayMs: 0,
    cooldownMs: 100,
  } as HapticPatternEntry,

  itemBoomerangCatch: {
    segments: pulse(30, 0.25),
    delayMs: 0,
    cooldownMs: 100,
  } as HapticPatternEntry,

  itemBombos: {
    segments: crescendo(300, 1.0),
    delayMs: 0,
    cooldownMs: 500,
  } as HapticPatternEntry,

  itemEther: {
    segments: pulse(200, 0.50),
    delayMs: 0,
    cooldownMs: 500,
  } as HapticPatternEntry,

  itemQuake: {
    segments: crescendo(400, 1.0),
    delayMs: 0,
    cooldownMs: 500,
  } as HapticPatternEntry,

  itemCaneSomaria: {
    segments: pulse(30, 0.25),
    delayMs: 0,
    cooldownMs: 100,
  } as HapticPatternEntry,

  itemCape: {
    segments: pulse(50, 0.15),
    delayMs: 0,
    cooldownMs: 300,
  } as HapticPatternEntry,

  itemShovel: {
    segments: pulse(60, 0.50),
    delayMs: 20,
    cooldownMs: 200,
  } as HapticPatternEntry,

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

export type HapticPatternId = keyof typeof HAPTIC_PATTERNS;
