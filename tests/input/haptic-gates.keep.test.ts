/* @layer tests @kind test */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { HapticSettings } from '@shared/types/settings';
import {
  HapticEventType, EnvironmentalEvent,
  updateHapticSettings, setVibrateFunction, handleHapticEvent,
  handleDashPulse, handleDeath, handleSpinAttack, handleEnvironmental, resetDashState,
} from '@shared/input/haptics';
import { DEFAULT_SETTINGS, serializeToIni } from '../../apps/web/src/lib/game/settings';
import { buildFeatureFlags } from '../../apps/web/src/lib/game/live-settings-flags';

// Haptics has two gate layers that must both pass for an in-game event to rumble:
//   1. The C master gate (enhanced_features0 & kFeatures0_Haptics) — off ⇒ zero JS host-calls.
//      Its bit reaches the core via the boot INI (Haptics key) and the live push (buildFeatureFlags).
//   2. Seven JS granular gates in the haptic service — one per event category — that drop an event
//      when its toggle is off even though the C hook fired.
// This locks both layers: the master bit is wired on both paths, and each granular gate blocks its
// own category while enabled, and only its own.

const HAPTICS_BIT = 1048576; // kFeatures0_Haptics — must match features.h / live-settings-flags.ts

const settings = (over: Partial<HapticSettings> = {}): HapticSettings => ({
  enabled: true, intensity: 100,
  swordSwing: true, swordHitEnemy: true, swordClink: true, damageTaken: true,
  itemUse: true, dashVibration: true, environmentalEffects: true,
  ...over,
});

// Advance the clock a long way on every read so per-pattern cooldowns (module-level state that
// persists across cases) never block a fresh fire — we assert gating, not debounce timing.
let clock = 0;
vi.spyOn(performance, 'now').mockImplementation(() => (clock += 100_000));

let calls: number;
beforeEach(() => {
  calls = 0;
  setVibrateFunction(() => { calls++; });
  resetDashState();
});

// Fire every event entry point once; returns how many reached the vibrate function.
const fireAll = () => {
  handleHapticEvent(HapticEventType.SWORD_SWING, 0);
  handleHapticEvent(HapticEventType.SWORD_HIT_ENEMY, 8);
  handleHapticEvent(HapticEventType.SWORD_CLINK, 0);
  handleHapticEvent(HapticEventType.DAMAGE_TAKEN, 8);
  handleHapticEvent(HapticEventType.ITEM_USED, 1 /* BOMBS */);
  handleHapticEvent(HapticEventType.ENVIRONMENTAL, EnvironmentalEvent.BOMB_EXPLODE);
  handleDashPulse();
};

describe('haptics master gate (C-side kFeatures0_Haptics)', () => {
  it('sends the feature bit on the live path when enabled, and clears it when disabled', () => {
    expect(buildFeatureFlags({ ...DEFAULT_SETTINGS, haptics: settings() }) & HAPTICS_BIT).toBe(HAPTICS_BIT);
    expect(buildFeatureFlags({ ...DEFAULT_SETTINGS, haptics: settings({ enabled: false }) }) & HAPTICS_BIT).toBe(0);
  });

  it('emits the Haptics key on the boot INI path so the bit is set from launch', () => {
    expect(serializeToIni({ ...DEFAULT_SETTINGS, haptics: settings() })).toContain('Haptics = 1');
    expect(serializeToIni({ ...DEFAULT_SETTINGS, haptics: settings({ enabled: false }) })).toContain('Haptics = 0');
  });

  it('JS service drops every event when the master toggle is off', () => {
    updateHapticSettings(settings({ enabled: false }));
    fireAll();
    handleDeath();
    handleSpinAttack();
    handleEnvironmental(EnvironmentalEvent.MIRROR_WARP);
    expect(calls).toBe(0);
  });
});

describe('haptics granular gates — each blocks only its own category', () => {
  it('sword swing', () => {
    updateHapticSettings(settings({ swordSwing: false }));
    handleHapticEvent(HapticEventType.SWORD_SWING, 0);
    handleSpinAttack(); // spin-attack release rides the same toggle
    expect(calls).toBe(0);
    updateHapticSettings(settings({ swordSwing: true }));
    handleHapticEvent(HapticEventType.SWORD_SWING, 0);
    expect(calls).toBe(1);
  });

  it('sword hit enemy', () => {
    updateHapticSettings(settings({ swordHitEnemy: false }));
    handleHapticEvent(HapticEventType.SWORD_HIT_ENEMY, 8);
    expect(calls).toBe(0);
    updateHapticSettings(settings({ swordHitEnemy: true }));
    handleHapticEvent(HapticEventType.SWORD_HIT_ENEMY, 8);
    expect(calls).toBe(1);
  });

  it('sword clink', () => {
    updateHapticSettings(settings({ swordClink: false }));
    handleHapticEvent(HapticEventType.SWORD_CLINK, 0);
    expect(calls).toBe(0);
    updateHapticSettings(settings({ swordClink: true }));
    handleHapticEvent(HapticEventType.SWORD_CLINK, 0);
    expect(calls).toBe(1);
  });

  it('damage taken (incl. death)', () => {
    updateHapticSettings(settings({ damageTaken: false }));
    handleHapticEvent(HapticEventType.DAMAGE_TAKEN, 8);
    handleDeath(); // death rides the same toggle
    expect(calls).toBe(0);
    updateHapticSettings(settings({ damageTaken: true }));
    handleHapticEvent(HapticEventType.DAMAGE_TAKEN, 8);
    expect(calls).toBe(1);
  });

  it('item use (incl. hookshot-wall + boomerang-catch)', () => {
    updateHapticSettings(settings({ itemUse: false }));
    handleHapticEvent(HapticEventType.ITEM_USED, 1 /* BOMBS */);
    handleHapticEvent(HapticEventType.HOOKSHOT_WALL, 0);
    handleHapticEvent(HapticEventType.BOOMERANG_CATCH, 0);
    expect(calls).toBe(0);
    updateHapticSettings(settings({ itemUse: true }));
    handleHapticEvent(HapticEventType.ITEM_USED, 1 /* BOMBS */);
    expect(calls).toBe(1);
  });

  it('dash vibration', () => {
    updateHapticSettings(settings({ dashVibration: false }));
    handleDashPulse();
    expect(calls).toBe(0);
    updateHapticSettings(settings({ dashVibration: true }));
    resetDashState(); // clear the inter-pulse throttle
    handleDashPulse();
    expect(calls).toBe(1);
  });

  it('environmental effects', () => {
    updateHapticSettings(settings({ environmentalEffects: false }));
    handleHapticEvent(HapticEventType.ENVIRONMENTAL, EnvironmentalEvent.BOMB_EXPLODE);
    handleEnvironmental(EnvironmentalEvent.MIRROR_WARP); // polling path rides the same toggle
    expect(calls).toBe(0);
    updateHapticSettings(settings({ environmentalEffects: true }));
    handleHapticEvent(HapticEventType.ENVIRONMENTAL, EnvironmentalEvent.BOMB_EXPLODE);
    expect(calls).toBe(1);
  });

  it('an unrelated toggle being off does not block other categories', () => {
    // Only sword-swing off; everything else must still pass.
    updateHapticSettings(settings({ swordSwing: false }));
    fireAll(); // sword-swing is one of the 7 fired; the other 6 should ring
    expect(calls).toBe(6);
  });
});
