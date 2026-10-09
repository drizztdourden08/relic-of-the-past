/* @layer shared-input @kind data */
import type { HapticPatternRecipe } from './haptic-pattern.type';

const COMBAT_PATTERNS = {
  swordSwing: {
    shape: { kind: 'pulse', durationMs: 60, intensity: 0.35 },
    delayMs: 0,
    cooldownMs: 0,
  },

  swordSwingRapid: {
    shape: { kind: 'pulse', durationMs: 30, intensity: 0.20 },
    delayMs: 0,
    cooldownMs: 0,
  },

  swordHitEnemy: {
    shape: { kind: 'pulse', durationMs: 80, intensity: 0.50 },
    delayMs: 0,
    cooldownMs: 60,
  },

  swordClink: {
    shape: { kind: 'doubleTap', durationMs: 60, intensity: 0.25 },
    gapMs: 15,
    delayMs: 0,
    cooldownMs: 100,
  },

  spinAttackRelease: {
    shape: { kind: 'pulse', durationMs: 120, intensity: 0.70 },
    delayMs: 0,
    cooldownMs: 300,
  },

  damageLow: {
    shape: { kind: 'pulse', durationMs: 100, intensity: 0.40 },
    delayMs: 0,
    cooldownMs: 200,
  },

  damageMedium: {
    shape: { kind: 'pulse', durationMs: 150, intensity: 0.70 },
    delayMs: 0,
    cooldownMs: 200,
  },

  damageHigh: {
    shape: { kind: 'pulse', durationMs: 200, intensity: 1.0 },
    delayMs: 0,
    cooldownMs: 200,
  },

  death: {
    shape: { kind: 'fadeOut', durationMs: 500, intensity: 1.0 },
    delayMs: 0,
    cooldownMs: 2000,
  },

  dashStep: {
    shape: { kind: 'pulse', durationMs: 20, intensity: 0.20 },
    delayMs: 0,
    cooldownMs: 0,
    minDurationExempt: true,
  },
} satisfies Record<string, HapticPatternRecipe>;

export { COMBAT_PATTERNS };
