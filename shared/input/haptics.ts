/**
 * Haptic Feedback Service — maps game events to vibration patterns.
 * All pattern definitions live in ./haptic-patterns.ts (the config file).
 * This module handles dispatch, cooldowns, delays, and settings gating.
 */

import type { VibrationSegment } from './base';
import { HAPTIC_PATTERNS, type HapticPatternEntry, type HapticPatternId } from './haptic-patterns';

// ─── Event Types (must match C-side enum in haptic_events.c) ───

const HapticEventType = {
  SWORD_SWING: 0,
  SWORD_HIT_ENEMY: 1,
  SWORD_CLINK: 2,
  DAMAGE_TAKEN: 3,
  ITEM_USED: 4,
  ENVIRONMENTAL: 5,
  HOOKSHOT_WALL: 6,
  BOOMERANG_CATCH: 7,
} as const;

type HapticEventTypeValue = (typeof HapticEventType)[keyof typeof HapticEventType];

// Environmental sub-events (param value when event_type = ENVIRONMENTAL)
const EnvironmentalEvent = {
  FALL_INTO_PIT: 0,
  LAND_FROM_LEDGE: 1,
  CHEST_OPEN: 2,
  BOMB_EXPLODE: 3,
  ENTER_WATER: 4,
  MIRROR_WARP: 5,
  QUAKE: 6,
  BOSS_DEFEATED: 7,
} as const;

// Item IDs (from the game's item switch in player.c)
const HapticItemId = {
  BOMBS: 1,
  BOOMERANG: 2,
  BOW: 3,
  HAMMER: 4,
  FIRE_ROD: 5,
  ICE_ROD: 6,
  BUG_NET: 7,
  FLUTE: 8,
  LAMP: 9,
  POWDER: 10,
  BOTTLE: 11,
  BOOK: 12,
  CANE_BYRNA: 13,
  HOOKSHOT: 14,
  BOMBOS: 15,
  ETHER: 16,
  QUAKE: 17,
  CANE_SOMARIA: 18,
  CAPE: 19,
  MIRROR: 20,
  SHOVEL: 21,
} as const;

// ─── Cooldown Tracking ───

const lastFireTime = new Map<string, number>();

const checkCooldown = (patternId: string, cooldownMs: number): boolean => {
  if (cooldownMs <= 0) return true;
  const now = performance.now();
  const last = lastFireTime.get(patternId) ?? 0;
  if (now - last < cooldownMs) return false;
  lastFireTime.set(patternId, now);
  return true;
};

// ─── Pattern Selection Logic ───

const getDamagePatternId = (damageAmount: number): HapticPatternId => {
  if (damageAmount >= 40) return 'damageHigh';
  if (damageAmount >= 24) return 'damageMedium';
  return 'damageLow';
};

const getItemPatternId = (itemId: number): HapticPatternId | null => {
  switch (itemId) {
    case HapticItemId.BOMBS: return 'itemBomb';
    case HapticItemId.BOOMERANG: return null; // catch handled by separate event
    case HapticItemId.BOW: return 'itemBow';
    case HapticItemId.HAMMER: return 'itemHammer';
    case HapticItemId.FIRE_ROD: return 'itemFireRod';
    case HapticItemId.ICE_ROD: return 'itemIceRod';
    case HapticItemId.HOOKSHOT: return 'itemHookshot';
    case HapticItemId.BOMBOS: return 'itemBombos';
    case HapticItemId.ETHER: return 'itemEther';
    case HapticItemId.QUAKE: return 'itemQuake';
    case HapticItemId.CANE_SOMARIA: return 'itemCaneSomaria';
    case HapticItemId.CANE_BYRNA: return 'itemCaneSomaria';
    case HapticItemId.CAPE: return 'itemCape';
    case HapticItemId.MIRROR: return null; // handled by environmental
    case HapticItemId.SHOVEL: return 'itemShovel';
    default: return null;
  }
};

const getEnvironmentalPatternId = (subEvent: number): HapticPatternId | null => {
  switch (subEvent) {
    case EnvironmentalEvent.FALL_INTO_PIT: return 'fallIntoPit';
    case EnvironmentalEvent.LAND_FROM_LEDGE: return 'landFromLedge';
    case EnvironmentalEvent.CHEST_OPEN: return 'chestOpen';
    case EnvironmentalEvent.BOMB_EXPLODE: return 'bombExplode';
    case EnvironmentalEvent.ENTER_WATER: return 'enterWater';
    case EnvironmentalEvent.MIRROR_WARP: return 'mirrorWarp';
    case EnvironmentalEvent.QUAKE: return 'quakeEnvironment';
    case EnvironmentalEvent.BOSS_DEFEATED: return 'bossDefeated';
    default: return null;
  }
};

// ─── Service State ───

interface HapticSettings {
  enabled: boolean;
  intensity: number;
  swordSwing: boolean;
  swordHitEnemy: boolean;
  swordClink: boolean;
  damageTaken: boolean;
  itemUse: boolean;
  dashVibration: boolean;
  environmentalEffects: boolean;
}

type VibrateFunction = (pattern: VibrationSegment[], gapMs?: number) => void;

let currentSettings: HapticSettings = {
  enabled: true,
  intensity: 70,
  swordSwing: true,
  swordHitEnemy: true,
  swordClink: true,
  damageTaken: true,
  itemUse: true,
  dashVibration: true,
  environmentalEffects: true,
};

let vibrateFn: VibrateFunction | null = null;
let lastDashPulseTime = 0;
const DASH_PULSE_INTERVAL_MS = 125; // ~8Hz

// ─── Public API ───

const updateHapticSettings = (settings: HapticSettings): void => {
  currentSettings = { ...settings };
};

const setVibrateFunction = (fn: VibrateFunction | null): void => {
  vibrateFn = fn;
};

// ─── Internal Dispatch ───

const scalePattern = (segments: VibrationSegment[]): VibrationSegment[] => {
  const scale = currentSettings.intensity / 100;
  return segments.map(seg => ({
    durationMs: seg.durationMs,
    intensity: Math.min(1.0, seg.intensity * scale),
  }));
};

const firePattern = (patternId: HapticPatternId): void => {
  if (!vibrateFn || !currentSettings.enabled) return;

  const entry: HapticPatternEntry = HAPTIC_PATTERNS[patternId];
  if (!entry) return;

  // Cooldown check
  if (entry.cooldownMs && !checkCooldown(patternId, entry.cooldownMs)) return;

  const scaled = scalePattern(entry.segments);
  const gapMs = entry.gapMs ?? 0;

  // Delay support
  if (entry.delayMs && entry.delayMs > 0) {
    setTimeout(() => {
      if (vibrateFn && currentSettings.enabled) {
        vibrateFn(scaled, gapMs);
      }
    }, entry.delayMs);
  } else {
    vibrateFn(scaled, gapMs);
  }
};

// ─── Event Handlers ───

const handleHapticEvent = (eventType: number, param: number): void => {
  if (!currentSettings.enabled || !vibrateFn) return;

  switch (eventType) {
    case HapticEventType.SWORD_SWING:
      if (currentSettings.swordSwing) firePattern(param === 1 ? 'swordSwingRapid' : 'swordSwing');
      break;

    case HapticEventType.SWORD_HIT_ENEMY:
      if (currentSettings.swordHitEnemy) firePattern('swordHitEnemy');
      break;

    case HapticEventType.SWORD_CLINK:
      if (currentSettings.swordClink) firePattern('swordClink');
      break;

    case HapticEventType.DAMAGE_TAKEN:
      if (currentSettings.damageTaken) firePattern(getDamagePatternId(param));
      break;

    case HapticEventType.ITEM_USED: {
      if (!currentSettings.itemUse) break;
      const id = getItemPatternId(param);
      if (id) firePattern(id);
      break;
    }

    case HapticEventType.ENVIRONMENTAL: {
      if (!currentSettings.environmentalEffects) break;
      const id = getEnvironmentalPatternId(param);
      if (id) firePattern(id);
      break;
    }

    case HapticEventType.HOOKSHOT_WALL:
      if (currentSettings.itemUse) firePattern('itemHookshotWall');
      break;

    case HapticEventType.BOOMERANG_CATCH:
      if (currentSettings.itemUse) firePattern('itemBoomerangCatch');
      break;
  }
};

const handleDashPulse = (): void => {
  if (!currentSettings.enabled || !currentSettings.dashVibration || !vibrateFn) return;

  const now = performance.now();
  if (now - lastDashPulseTime < DASH_PULSE_INTERVAL_MS) return;
  lastDashPulseTime = now;
  firePattern('dashStep');
};

const resetDashState = (): void => {
  lastDashPulseTime = 0;
};

const handleDeath = (): void => {
  if (!currentSettings.enabled || !currentSettings.damageTaken || !vibrateFn) return;
  firePattern('death');
};

const handleSpinAttack = (): void => {
  if (!currentSettings.enabled || !currentSettings.swordSwing || !vibrateFn) return;
  firePattern('spinAttackRelease');
};

const handleEnvironmental = (subEvent: number): void => {
  if (!currentSettings.enabled || !currentSettings.environmentalEffects || !vibrateFn) return;
  const id = getEnvironmentalPatternId(subEvent);
  if (id) firePattern(id);
};

const handlePickup = (type: 'heartPiece' | 'pendantCrystal' | 'largeRupee'): void => {
  if (!currentSettings.enabled || !currentSettings.environmentalEffects || !vibrateFn) return;
  firePattern(type);
};

export { HapticEventType, EnvironmentalEvent, HapticItemId, updateHapticSettings, setVibrateFunction, handleHapticEvent, handleDashPulse, resetDashState, handleDeath, handleSpinAttack, handleEnvironmental, handlePickup };
export type { HapticEventTypeValue, HapticSettings };
