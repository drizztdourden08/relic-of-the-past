/* @layer shared-input @kind logic */
/**
 * Per-device rumble amplification: a user-set multiplier layered on top of a
 * family's strength curve (see shared/input/family/vibration-shaping.ts), for
 * a controller whose motors still feel weak after shaping. Neutral at 1;
 * persisted per device in shared/storage/rumble-strength.ts and cached here
 * in memory so a dispatch never has to wait on disk I/O.
 */

const MIN_RUMBLE_STRENGTH = 0.5;
const MAX_RUMBLE_STRENGTH = 3;
const DEFAULT_RUMBLE_STRENGTH = 1;

const clampRumbleStrength = (value: number): number => {
  if (!Number.isFinite(value)) return DEFAULT_RUMBLE_STRENGTH;
  return Math.min(MAX_RUMBLE_STRENGTH, Math.max(MIN_RUMBLE_STRENGTH, value));
};

/** Applies the multiplier on top of an already-shaped intensity, clamped to
 *  the transport's valid 0-1 range so a large multiplier can never send an
 *  out-of-range value downstream. */
const applyRumbleStrength = (intensity: number, strength: number): number => {
  return Math.min(1, Math.max(0, intensity * strength));
};

const strengthCache = new Map<string, number>();

const getCachedRumbleStrength = (deviceKey: string): number => {
  return strengthCache.get(deviceKey) ?? DEFAULT_RUMBLE_STRENGTH;
};

const setCachedRumbleStrength = (deviceKey: string, value: number): void => {
  strengthCache.set(deviceKey, clampRumbleStrength(value));
};

/** Bulk-primes the cache from a freshly-read persisted store (see
 *  shared/storage/rumble-strength.ts). A value out of range on disk is
 *  clamped, never trusted as-is. */
const loadRumbleStrengthCache = (store: Record<string, number>): void => {
  for (const [deviceKey, value] of Object.entries(store)) setCachedRumbleStrength(deviceKey, value);
};

export {
  DEFAULT_RUMBLE_STRENGTH,
  MAX_RUMBLE_STRENGTH,
  MIN_RUMBLE_STRENGTH,
  applyRumbleStrength,
  clampRumbleStrength,
  getCachedRumbleStrength,
  loadRumbleStrengthCache,
  setCachedRumbleStrength,
};
