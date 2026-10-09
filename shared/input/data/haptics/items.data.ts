/* @layer shared-input @kind data */
import type { HapticPatternRecipe } from './haptic-pattern.type';

const ITEM_PATTERNS = {
  itemBow: {
    shape: { kind: 'pulse', durationMs: 40, intensity: 0.20 },
    delayMs: 20,
    cooldownMs: 150,
  },

  itemBomb: {
    shape: { kind: 'pulse', durationMs: 150, intensity: 0.70 },
    delayMs: 0,
    cooldownMs: 100,
  },

  itemHookshot: {
    shape: { kind: 'pulse', durationMs: 60, intensity: 0.50 },
    delayMs: 0,
    cooldownMs: 200,
  },

  itemHookshotWall: {
    shape: { kind: 'pulse', durationMs: 50, intensity: 0.35 },
    delayMs: 0,
    cooldownMs: 200,
  },

  itemHammer: {
    shape: { kind: 'pulse', durationMs: 100, intensity: 0.70 },
    delayMs: 20,
    cooldownMs: 150,
  },

  itemFireRod: {
    shape: { kind: 'pulse', durationMs: 50, intensity: 0.50 },
    delayMs: 0,
    cooldownMs: 100,
  },

  itemIceRod: {
    shape: { kind: 'segments', segments: [{ durationMs: 50, intensity: 0.50 }, { durationMs: 30, intensity: 0.30 }] },
    delayMs: 0,
    cooldownMs: 100,
  },

  itemBoomerangCatch: {
    shape: { kind: 'pulse', durationMs: 30, intensity: 0.25 },
    delayMs: 0,
    cooldownMs: 100,
  },

  itemBombos: {
    shape: { kind: 'crescendo', durationMs: 300, intensity: 1.0 },
    delayMs: 0,
    cooldownMs: 500,
  },

  itemEther: {
    shape: { kind: 'pulse', durationMs: 200, intensity: 0.50 },
    delayMs: 0,
    cooldownMs: 500,
  },

  itemQuake: {
    shape: { kind: 'crescendo', durationMs: 400, intensity: 1.0 },
    delayMs: 0,
    cooldownMs: 500,
  },

  itemCaneSomaria: {
    shape: { kind: 'pulse', durationMs: 30, intensity: 0.25 },
    delayMs: 0,
    cooldownMs: 100,
  },

  itemCape: {
    shape: { kind: 'pulse', durationMs: 50, intensity: 0.15 },
    delayMs: 0,
    cooldownMs: 300,
  },

  itemShovel: {
    shape: { kind: 'pulse', durationMs: 60, intensity: 0.50 },
    delayMs: 20,
    cooldownMs: 200,
  },
} satisfies Record<string, HapticPatternRecipe>;

export { ITEM_PATTERNS };
