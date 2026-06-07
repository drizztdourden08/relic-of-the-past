/* @layer shared-input @kind data */
/**
 * Item-use haptic patterns.
 */

import type { HapticPatternEntry } from './types';
import { pulse, crescendo } from './builders';

const ITEM_PATTERNS = {

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

} as const;

export { ITEM_PATTERNS };
