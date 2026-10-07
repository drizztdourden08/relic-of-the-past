/* @layer shared-game @kind data */
/**
 * Pool item names of the capacity upgrades, one per family and jump size
 * (index = jump − 1). The reference randomizer's own names cover a jump of
 * one tier, two tiers and the whole span for the counted families and the
 * two meter levels; the remaining jump sizes are this app's names, kept in
 * the same shape. The wallet ladder is uniform (100 rupees per step), so its
 * names carry the rupee value of the jump. A progressive plan ships ONE
 * name per family instead: every pickup climbs to the next planned rung,
 * so the name carries no jump at all.
 */
import type { CapacityFamilyId } from './capacity-family.type';

const CAPACITY_FAMILY_IDS: readonly CapacityFamilyId[] = ['explosives', 'projectiles', 'meter', 'wallet'];

const EXPLOSIVES_UPGRADE_NAMES: readonly string[] = [
  'Bomb Upgrade (+5)',
  'Bomb Upgrade (+10)',
  'Bomb Upgrade (+3 tiers)',
  'Bomb Upgrade (+4 tiers)',
  'Bomb Upgrade (+5 tiers)',
  'Bomb Upgrade (+6 tiers)',
  'Bomb Upgrade (+7 tiers)',
  'Bomb Upgrade (50)',
];

const PROJECTILES_UPGRADE_NAMES: readonly string[] = [
  'Arrow Upgrade (+5)',
  'Arrow Upgrade (+10)',
  'Arrow Upgrade (+3 tiers)',
  'Arrow Upgrade (+4 tiers)',
  'Arrow Upgrade (+5 tiers)',
  'Arrow Upgrade (+6 tiers)',
  'Arrow Upgrade (+7 tiers)',
  'Arrow Upgrade (70)',
];

const METER_UPGRADE_NAMES: readonly string[] = [
  'Magic Upgrade (1/2)',
  'Magic Upgrade (1/4)',
];

/** 100 steps of the 0 ... 9999 ladder: "Wallet Upgrade (+100)" ... "(+10000)" (the first rung is 99). */
const WALLET_UPGRADE_NAMES: readonly string[] =
  Array.from({ length: 100 }, (_, index) => `Wallet Upgrade (+${(index + 1) * 100})`);

/** The progressive item of each family: one name, the plan decides the jump per pickup. */
const CAPACITY_PROGRESSIVE_NAMES: Readonly<Record<CapacityFamilyId, string>> = {
  explosives: 'Progressive Bomb Capacity',
  projectiles: 'Progressive Arrow Capacity',
  meter: 'Progressive Magic Capacity',
  wallet: 'Progressive Wallet',
};

const CAPACITY_UPGRADE_NAMES: Readonly<Record<CapacityFamilyId, readonly string[]>> = {
  explosives: EXPLOSIVES_UPGRADE_NAMES,
  projectiles: PROJECTILES_UPGRADE_NAMES,
  meter: METER_UPGRADE_NAMES,
  wallet: WALLET_UPGRADE_NAMES,
};

/** What the receipt line calls each family: the container that grew. */
const CAPACITY_RECEIPT_LABELS: Readonly<Record<CapacityFamilyId, string>> = {
  explosives: 'Bomb bag',
  projectiles: 'Arrows',
  meter: 'Magic meter',
  wallet: 'Wallet',
};

export {
  CAPACITY_FAMILY_IDS,
  CAPACITY_PROGRESSIVE_NAMES,
  CAPACITY_RECEIPT_LABELS,
  CAPACITY_UPGRADE_NAMES,
  EXPLOSIVES_UPGRADE_NAMES,
  METER_UPGRADE_NAMES,
  PROJECTILES_UPGRADE_NAMES,
  WALLET_UPGRADE_NAMES,
};
