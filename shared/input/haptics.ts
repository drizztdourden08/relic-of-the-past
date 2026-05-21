/**
 * Haptic Feedback Service — maps game events to vibration patterns.
 * Central dispatch for all haptic feedback in the game.
 */

import type { VibrationSegment } from './base';

// ─── Event Types (must match C-side enum in haptic_events.c) ───

export const HapticEventType = {
  SWORD_SWING: 0,
  SWORD_HIT_ENEMY: 1,
  SWORD_CLINK: 2,
  DAMAGE_TAKEN: 3,
  ITEM_USED: 4,
  ENVIRONMENTAL: 5,
} as const;

export type HapticEventTypeValue = (typeof HapticEventType)[keyof typeof HapticEventType];

// Environmental sub-events (param value when event_type = ENVIRONMENTAL)
export const EnvironmentalEvent = {
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
export const HapticItemId = {
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

// ─── Vibration Pattern Library ───

/** Very faint — barely perceptible */
function veryFaint(durationMs: number): VibrationSegment[] {
  return [{ durationMs, intensity: 0.15 }];
}

/** Faint — noticeable but subtle */
function faint(durationMs: number): VibrationSegment[] {
  return [{ durationMs, intensity: 0.25 }];
}

/** Medium — normal feedback */
function medium(durationMs: number): VibrationSegment[] {
  return [{ durationMs, intensity: 0.50 }];
}

/** Strong — impactful */
function strong(durationMs: number): VibrationSegment[] {
  return [{ durationMs, intensity: 0.70 }];
}

/** Heavy — maximum impact */
function heavy(durationMs: number): VibrationSegment[] {
  return [{ durationMs, intensity: 1.0 }];
}

/** Double tap pattern */
function doubleTap(durationMs: number, intensity: number): VibrationSegment[] {
  const half = Math.floor(durationMs / 2);
  return [
    { durationMs: half, intensity },
    { durationMs: half, intensity },
  ];
}

/** Crescendo — ramps up intensity */
function crescendo(durationMs: number, maxIntensity: number): VibrationSegment[] {
  const steps = 4;
  const stepDuration = Math.floor(durationMs / steps);
  return Array.from({ length: steps }, (_, i) => ({
    durationMs: stepDuration,
    intensity: (maxIntensity / steps) * (i + 1),
  }));
}

/** Fade out — starts strong and decays */
function fadeOut(durationMs: number, startIntensity: number): VibrationSegment[] {
  const steps = 4;
  const stepDuration = Math.floor(durationMs / steps);
  return Array.from({ length: steps }, (_, i) => ({
    durationMs: stepDuration,
    intensity: startIntensity * (1 - i / steps),
  }));
}

// ─── Pattern Definitions ───

const PATTERNS = {
  // Sword
  swordSwing: veryFaint(40),
  swordHitEnemy: medium(80),
  swordClink: doubleTap(60, 0.25),
  spinAttackRelease: strong(120),

  // Damage taken (scaled by amount in getDamagePattern)
  damageLow: [{ durationMs: 100, intensity: 0.40 }],        // 1-2 hearts
  damageMedium: [{ durationMs: 150, intensity: 0.70 }],     // 3-4 hearts
  damageHigh: heavy(200),                                     // 5+ hearts
  death: fadeOut(500, 1.0),

  // Dash
  dashStep: [{ durationMs: 20, intensity: 0.20 }],

  // Items
  itemBomb: strong(150),
  itemHookshot: medium(60),
  itemHookshotWall: faint(40),
  itemHammer: strong(100),
  itemFireRod: medium(50),
  itemIceRod: [...medium(50), { durationMs: 30, intensity: 0.30 }],
  itemBombos: crescendo(300, 1.0),
  itemEther: medium(200),
  itemQuake: crescendo(400, 1.0),
  itemCaneSomaria: faint(30),
  itemCape: veryFaint(50),
  itemBoomerangCatch: faint(30),
  itemShovel: medium(60),

  // Environmental
  fallIntoPit: medium(150),
  landFromLedge: faint(40),
  chestOpen: medium(100),
  bombExplode: strong(150),
  enterWater: faint(40),
  mirrorWarp: crescendo(150, 0.50),
  quakeEnvironment: crescendo(400, 1.0),
  bossDefeated: fadeOut(300, 0.80),

  // Pickups
  heartPiece: medium(120),
  pendantCrystal: strong(200),
  largeRupee: veryFaint(30),
} as const;

// ─── Pattern Selection Logic ───

function getDamagePattern(damageAmount: number): VibrationSegment[] {
  // damageAmount is in 1/8th hearts
  if (damageAmount >= 40) return PATTERNS.damageHigh;  // 5+ full hearts
  if (damageAmount >= 24) return PATTERNS.damageMedium; // 3-4 hearts
  return PATTERNS.damageLow;
}

function getItemPattern(itemId: number): VibrationSegment[] | null {
  switch (itemId) {
    case HapticItemId.BOMBS: return PATTERNS.itemBomb;
    case HapticItemId.BOOMERANG: return PATTERNS.itemBoomerangCatch;
    case HapticItemId.BOW: return null; // too subtle
    case HapticItemId.HAMMER: return PATTERNS.itemHammer;
    case HapticItemId.FIRE_ROD: return PATTERNS.itemFireRod;
    case HapticItemId.ICE_ROD: return PATTERNS.itemIceRod;
    case HapticItemId.HOOKSHOT: return PATTERNS.itemHookshot;
    case HapticItemId.BOMBOS: return PATTERNS.itemBombos;
    case HapticItemId.ETHER: return PATTERNS.itemEther;
    case HapticItemId.QUAKE: return PATTERNS.itemQuake;
    case HapticItemId.CANE_SOMARIA: return PATTERNS.itemCaneSomaria;
    case HapticItemId.CANE_BYRNA: return PATTERNS.itemCaneSomaria;
    case HapticItemId.CAPE: return PATTERNS.itemCape;
    case HapticItemId.MIRROR: return null; // handled by environmental
    case HapticItemId.SHOVEL: return PATTERNS.itemShovel;
    case HapticItemId.LAMP: return null;
    case HapticItemId.POWDER: return null;
    case HapticItemId.BOTTLE: return null;
    case HapticItemId.BOOK: return null;
    case HapticItemId.FLUTE: return null;
    case HapticItemId.BUG_NET: return null;
    default: return null;
  }
}

function getEnvironmentalPattern(subEvent: number): VibrationSegment[] | null {
  switch (subEvent) {
    case EnvironmentalEvent.FALL_INTO_PIT: return PATTERNS.fallIntoPit;
    case EnvironmentalEvent.LAND_FROM_LEDGE: return PATTERNS.landFromLedge;
    case EnvironmentalEvent.CHEST_OPEN: return PATTERNS.chestOpen;
    case EnvironmentalEvent.BOMB_EXPLODE: return PATTERNS.bombExplode;
    case EnvironmentalEvent.ENTER_WATER: return PATTERNS.enterWater;
    case EnvironmentalEvent.MIRROR_WARP: return PATTERNS.mirrorWarp;
    case EnvironmentalEvent.QUAKE: return PATTERNS.quakeEnvironment;
    case EnvironmentalEvent.BOSS_DEFEATED: return PATTERNS.bossDefeated;
    default: return null;
  }
}

// ─── Service State ───

export interface HapticSettings {
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
  enabled: false,
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

/** Update haptic settings (called when settings change) */
export function updateHapticSettings(settings: HapticSettings): void {
  currentSettings = { ...settings };
}

/** Register the vibration dispatch function (from controller system) */
export function setVibrateFunction(fn: VibrateFunction | null): void {
  vibrateFn = fn;
}

/** Scale a pattern by the global intensity multiplier */
function scalePattern(pattern: VibrationSegment[]): VibrationSegment[] {
  const scale = currentSettings.intensity / 100;
  return pattern.map(seg => ({
    durationMs: seg.durationMs,
    intensity: Math.min(1.0, seg.intensity * scale),
  }));
}

/** Dispatch a vibration pattern if enabled */
function dispatch(pattern: VibrationSegment[] | null, gapMs?: number): void {
  if (!pattern || !vibrateFn || !currentSettings.enabled) return;
  vibrateFn(scalePattern(pattern), gapMs);
}

/** Handle a haptic event from the C game hooks */
export function handleHapticEvent(eventType: number, param: number): void {
  if (!currentSettings.enabled || !vibrateFn) return;

  switch (eventType) {
    case HapticEventType.SWORD_SWING:
      if (currentSettings.swordSwing) dispatch(PATTERNS.swordSwing);
      break;

    case HapticEventType.SWORD_HIT_ENEMY:
      if (currentSettings.swordHitEnemy) dispatch(PATTERNS.swordHitEnemy);
      break;

    case HapticEventType.SWORD_CLINK:
      if (currentSettings.swordClink) dispatch(PATTERNS.swordClink, 15);
      break;

    case HapticEventType.DAMAGE_TAKEN:
      if (currentSettings.damageTaken) dispatch(getDamagePattern(param));
      break;

    case HapticEventType.ITEM_USED:
      if (currentSettings.itemUse) dispatch(getItemPattern(param));
      break;

    case HapticEventType.ENVIRONMENTAL:
      if (currentSettings.environmentalEffects) dispatch(getEnvironmentalPattern(param));
      break;
  }
}

/** Handle dash vibration (called from polling loop when Link is running) */
export function handleDashPulse(): void {
  if (!currentSettings.enabled || !currentSettings.dashVibration || !vibrateFn) return;

  const now = performance.now();
  if (now - lastDashPulseTime < DASH_PULSE_INTERVAL_MS) return;
  lastDashPulseTime = now;
  dispatch(PATTERNS.dashStep);
}

/** Reset dash timer (call when dash ends) */
export function resetDashState(): void {
  lastDashPulseTime = 0;
}

/** Trigger death vibration pattern */
export function handleDeath(): void {
  if (!currentSettings.enabled || !currentSettings.damageTaken || !vibrateFn) return;
  dispatch(PATTERNS.death);
}

/** Trigger spin attack release vibration */
export function handleSpinAttack(): void {
  if (!currentSettings.enabled || !currentSettings.swordSwing || !vibrateFn) return;
  dispatch(PATTERNS.spinAttackRelease);
}

/** Trigger environmental event from JS polling */
export function handleEnvironmental(subEvent: number): void {
  if (!currentSettings.enabled || !currentSettings.environmentalEffects || !vibrateFn) return;
  dispatch(getEnvironmentalPattern(subEvent));
}

/** Trigger pickup vibration (heart piece, pendant, etc.) */
export function handlePickup(type: 'heartPiece' | 'pendantCrystal' | 'largeRupee'): void {
  if (!currentSettings.enabled || !currentSettings.environmentalEffects || !vibrateFn) return;
  dispatch(PATTERNS[type]);
}

export { PATTERNS };
