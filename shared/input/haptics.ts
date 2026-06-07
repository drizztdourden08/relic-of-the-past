/* @layer shared-input @kind logic */
/**
 * Haptic Feedback Service — maps game events to vibration patterns.
 * Pattern definitions live in ./data/haptics; event enums + pattern selectors in
 * ./haptic-events. This module handles dispatch, cooldowns, delays, settings gating.
 */

import type { VibrationSegment } from './base';
import { HAPTIC_PATTERNS, type HapticPatternEntry, type HapticPatternId } from './data/haptics';
import {
  HapticEventType, EnvironmentalEvent, HapticItemId,
  getDamagePatternId, getItemPatternId, getEnvironmentalPatternId,
} from './haptic-events';
import type { HapticEventTypeValue } from './haptic-events';

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
