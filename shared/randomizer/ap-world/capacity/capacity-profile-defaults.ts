/* @layer shared-game @kind logic */
/**
 * The two fixed profiles. REFERENCE is the reference randomizer's own
 * baseline (its single half-meter item at the bat, nothing else in the
 * pool, no fairy-slot locations) — the world every oracle and existing view
 * was built on, and what an absent profile means everywhere. LEGACY_SHUFFLE_ON
 * is the Custom shape that reproduces the pre-v2 "shuffle capacity
 * upgrades" pool byte-for-byte: one one-tier item per fairy slot, so a live
 * seed regenerates the same placement from its adapted snapshot. DEFAULT is
 * what a NEW profile starts on: the two pond-fed families in the pool, the
 * meter and the wallet on a Custom ladder. It is the catalog baseline of the
 * capacity rows and the creation form's starting profile, and nothing else:
 * an absent profile still means REFERENCE.
 */
import type { CapacityProfile, CustomFamilySetting } from './capacity-profile.type';

const customSetting = (start: number, max: number, count: number): CustomFamilySetting =>
  ({ mode: 'custom', start, max, count, shape: { curve: 'equal' } });

const REFERENCE_CAPACITY_PROFILE: CapacityProfile = {
  explosives: { mode: 'vanilla' },
  projectiles: { mode: 'vanilla' },
  meter: { mode: 'vanilla-in-pool' },
  wallet: { mode: 'vanilla' },
};

/**
 * Every family untouched — what the master switch means when it is off. The
 * reference profile is NOT this: it pools the single half-cost upgrade, so a
 * feature switched off entirely needs a profile of its own.
 */
const VANILLA_CAPACITY_PROFILE: CapacityProfile = {
  explosives: { mode: 'vanilla' },
  projectiles: { mode: 'vanilla' },
  meter: { mode: 'vanilla' },
  wallet: { mode: 'vanilla' },
};

const LEGACY_SHUFFLE_ON_PROFILE: CapacityProfile = {
  explosives: customSetting(10, 15, 1),
  projectiles: customSetting(30, 35, 1),
  meter: { mode: 'vanilla-in-pool' },
  wallet: { mode: 'vanilla' },
};

/**
 * Where a fresh profile starts. All four families ride a Custom ladder from
 * an empty rung: bombs and arrows climb to 50 and 70 over seven equal steps,
 * the meter over its three tiers, and the wallet from an empty purse over
 * eight geometric jumps.
 */
const DEFAULT_CAPACITY_PROFILE: CapacityProfile = {
  explosives: customSetting(0, 50, 7),
  projectiles: customSetting(0, 70, 7),
  meter: customSetting(0, 3, 3),
  wallet: { mode: 'custom', start: 0, max: 9999, count: 8, shape: { curve: 'geometric' } },
};

/** The profile a v1 snapshot's single toggle stood for. */
const legacyCapacityProfile = (shuffleOn: boolean): CapacityProfile =>
  shuffleOn ? LEGACY_SHUFFLE_ON_PROFILE : REFERENCE_CAPACITY_PROFILE;

export {
  DEFAULT_CAPACITY_PROFILE, LEGACY_SHUFFLE_ON_PROFILE, REFERENCE_CAPACITY_PROFILE, VANILLA_CAPACITY_PROFILE,
  customSetting, legacyCapacityProfile,
};
