/* @layer shared-game @kind data */
import type { CapacityFamilyId } from './capacity-family.type';
import { WALLET_UPGRADE_NAMES } from './wallet-upgrade-names.constants';

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
