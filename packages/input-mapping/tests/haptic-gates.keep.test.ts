/* @layer tests @kind test */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { HapticSettings } from '@rotp/features';
import { HapticEventType, EnvironmentalEvent, updateHapticSettings, setVibrateFunction, handleHapticEvent, handleDashPulse, handleDeath, handleSpinAttack, handleEnvironmental, resetDashState } from '@rotp/input-mapping';
import { DEFAULT_SETTINGS, serializeToIni, buildFeatureFlags } from '@rotp/game-core';

const HAPTICS_BIT = 1048576;
const BOMBS_ITEM = 1;

const settings = (over: Partial<HapticSettings> = {}): HapticSettings => ({
  enabled: true, intensity: 100,
  swordSwing: true, swordHitEnemy: true, swordClink: true, damageTaken: true,
  itemUse: true, dashVibration: true, environmentalEffects: true,
  ...over,
});

let clock = 0;
vi.spyOn(performance, 'now').mockImplementation(() => (clock += 100_000));

let calls: number;
beforeEach(() => {
  calls = 0;
  setVibrateFunction(() => { calls++; });
  resetDashState();
});

const fireAll = () => {
  handleHapticEvent(HapticEventType.SWORD_SWING, 0);
  handleHapticEvent(HapticEventType.SWORD_HIT_ENEMY, 8);
  handleHapticEvent(HapticEventType.SWORD_CLINK, 0);
  handleHapticEvent(HapticEventType.DAMAGE_TAKEN, 8);
  handleHapticEvent(HapticEventType.ITEM_USED, BOMBS_ITEM);
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

describe('haptics per-category gates each block only their own category', () => {
  it('sword swing', () => {
    updateHapticSettings(settings({ swordSwing: false }));
    handleHapticEvent(HapticEventType.SWORD_SWING, 0);
    handleSpinAttack();
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
    handleDeath();
    expect(calls).toBe(0);
    updateHapticSettings(settings({ damageTaken: true }));
    handleHapticEvent(HapticEventType.DAMAGE_TAKEN, 8);
    expect(calls).toBe(1);
  });
});

describe('haptics per-category gates each block only their own category', () => {
  it('item use (incl. hookshot-wall + boomerang-catch)', () => {
    updateHapticSettings(settings({ itemUse: false }));
    handleHapticEvent(HapticEventType.ITEM_USED, BOMBS_ITEM);
    handleHapticEvent(HapticEventType.HOOKSHOT_WALL, 0);
    handleHapticEvent(HapticEventType.BOOMERANG_CATCH, 0);
    expect(calls).toBe(0);
    updateHapticSettings(settings({ itemUse: true }));
    handleHapticEvent(HapticEventType.ITEM_USED, BOMBS_ITEM);
    expect(calls).toBe(1);
  });

  it('dash vibration', () => {
    updateHapticSettings(settings({ dashVibration: false }));
    handleDashPulse();
    expect(calls).toBe(0);
    updateHapticSettings(settings({ dashVibration: true }));
    resetDashState();
    handleDashPulse();
    expect(calls).toBe(1);
  });

  it('environmental effects', () => {
    updateHapticSettings(settings({ environmentalEffects: false }));
    handleHapticEvent(HapticEventType.ENVIRONMENTAL, EnvironmentalEvent.BOMB_EXPLODE);
    handleEnvironmental(EnvironmentalEvent.MIRROR_WARP);
    expect(calls).toBe(0);
    updateHapticSettings(settings({ environmentalEffects: true }));
    handleHapticEvent(HapticEventType.ENVIRONMENTAL, EnvironmentalEvent.BOMB_EXPLODE);
    expect(calls).toBe(1);
  });

  it('an unrelated toggle being off does not block other categories', () => {
    updateHapticSettings(settings({ swordSwing: false }));
    fireAll();
    expect(calls).toBe(6);
  });
});
