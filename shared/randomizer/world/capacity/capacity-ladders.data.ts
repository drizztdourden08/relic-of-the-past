/* @layer shared-game @kind data */
import type { CapacityFamilyId } from '@shared/game/data/capacity-family.type';

const EXPLOSIVES_TIERS: readonly number[] = [0, 10, 15, 20, 25, 30, 35, 40, 50];

const PROJECTILES_TIERS: readonly number[] = [0, 30, 35, 40, 45, 50, 55, 60, 70];

const METER_TIERS: readonly number[] = [0, 1, 2, 3];

const METER_LEVEL_LABELS: readonly string[] = ['none', 'normal', 'half', 'quarter'];

const WALLET_LADDER_LAST = 100;

const WALLET_LADDER: readonly number[] = [
  0, 99, 199, 299, 399, 499, 599, 699, 799, 899, 999, 1099,
  1199, 1299, 1399, 1499, 1599, 1699, 1799, 1899, 1999, 2099, 2199, 2299,
  2399, 2499, 2599, 2699, 2799, 2899, 2999, 3099, 3199, 3299, 3399, 3499,
  3599, 3699, 3799, 3899, 3999, 4099, 4199, 4299, 4399, 4499, 4599, 4699,
  4799, 4899, 4999, 5099, 5199, 5299, 5399, 5499, 5599, 5699, 5799, 5899,
  5999, 6099, 6199, 6299, 6399, 6499, 6599, 6699, 6799, 6899, 6999, 7099,
  7199, 7299, 7399, 7499, 7599, 7699, 7799, 7899, 7999, 8099, 8199, 8299,
  8399, 8499, 8599, 8699, 8799, 8899, 8999, 9099, 9199, 9299, 9399, 9499,
  9599, 9699, 9799, 9899, 9999,
];

const VANILLA_RUNG: Readonly<Record<CapacityFamilyId, number>> = {
  explosives: 1,
  projectiles: 1,
  meter: 1,
  wallet: 10,
};

export {
  EXPLOSIVES_TIERS,
  METER_LEVEL_LABELS,
  METER_TIERS,
  PROJECTILES_TIERS,
  VANILLA_RUNG,
  WALLET_LADDER,
  WALLET_LADDER_LAST,
};
