/* @layer shared-input @kind data */
import type { HapticPatternRecipe } from './haptic-pattern.type';

const ENVIRONMENT_PATTERNS = {
  fallIntoPit: {
    shape: { kind: 'pulse', durationMs: 150, intensity: 0.55 },
    delayMs: 0,
    cooldownMs: 500,
  },

  landFromLedge: {
    shape: { kind: 'pulse', durationMs: 40, intensity: 0.25 },
    delayMs: 0,
    cooldownMs: 200,
  },

  chestOpen: {
    shape: { kind: 'pulse', durationMs: 100, intensity: 0.50 },
    delayMs: 50,
    cooldownMs: 500,
  },

  bombExplode: {
    shape: { kind: 'pulse', durationMs: 150, intensity: 0.70 },
    delayMs: 0,
    cooldownMs: 100,
  },

  enterWater: {
    shape: { kind: 'pulse', durationMs: 40, intensity: 0.25 },
    delayMs: 0,
    cooldownMs: 1000,
  },

  mirrorWarp: {
    shape: { kind: 'crescendo', durationMs: 200, intensity: 0.55 },
    delayMs: 0,
    cooldownMs: 2000,
  },

  quakeEnvironment: {
    shape: { kind: 'crescendo', durationMs: 400, intensity: 1.0 },
    delayMs: 0,
    cooldownMs: 500,
  },

  bossDefeated: {
    shape: { kind: 'fadeOut', durationMs: 400, intensity: 0.90 },
    delayMs: 100,
    cooldownMs: 5000,
  },

  heartPiece: {
    shape: { kind: 'pulse', durationMs: 120, intensity: 0.50 },
    delayMs: 50,
    cooldownMs: 1000,
  },

  pendantCrystal: {
    shape: { kind: 'pulse', durationMs: 200, intensity: 0.70 },
    delayMs: 100,
    cooldownMs: 5000,
  },

  largeRupee: {
    shape: { kind: 'pulse', durationMs: 30, intensity: 0.15 },
    delayMs: 0,
    cooldownMs: 200,
  },
} satisfies Record<string, HapticPatternRecipe>;

export { ENVIRONMENT_PATTERNS };
