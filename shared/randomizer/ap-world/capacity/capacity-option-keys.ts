/* @layer shared-game @kind logic */
/**
 * The 22 snapshot keys of the capacity profile: six per counted family
 * (mode · start · max · count · curve · jumps), four for the meter (its
 * curve is fixed to equal, one item per level climbed), six for the wallet.
 * The mode rows are what the panel renders; the value rows sit behind them.
 */
import { CAPACITY_FAMILY_IDS } from '@shared/game/data/capacity-upgrade-names.data';
import type { CapacityFamilyId } from './capacity-profile.type';

type CapacityField = 'mode' | 'start' | 'max' | 'count' | 'curve' | 'jumps';

const FIELDS_OF: Readonly<Record<CapacityFamilyId, readonly CapacityField[]>> = {
  explosives: ['mode', 'start', 'max', 'count', 'curve', 'jumps'],
  projectiles: ['mode', 'start', 'max', 'count', 'curve', 'jumps'],
  meter: ['mode', 'start', 'max', 'count'],
  wallet: ['mode', 'start', 'max', 'count', 'curve', 'jumps'],
};

const capacityKeyOf = (family: CapacityFamilyId, field: CapacityField): string => `capacity_${family}_${field}`;

const capacityFieldsOf = (family: CapacityFamilyId): readonly CapacityField[] => FIELDS_OF[family];

const CAPACITY_OPTION_KEYS: readonly string[] = CAPACITY_FAMILY_IDS.flatMap((family) =>
  FIELDS_OF[family].map((field) => capacityKeyOf(family, field)));

const KEY_PATTERN = /^capacity_(explosives|projectiles|meter|wallet)_(mode|start|max|count|curve|jumps)$/;

/** capacity_<family>_<field> → the family, for any of its rows. */
const familyOfOptionKey = (key: string): CapacityFamilyId | undefined => {
  const match = KEY_PATTERN.exec(key);
  if (match === null) return undefined;
  const family = match[1] as CapacityFamilyId;
  return (FIELDS_OF[family] as readonly string[]).includes(match[2]) ? family : undefined;
};

/** The retired v1 toggle; kept in the catalog (locked) because the reference declares it. */
const LEGACY_CAPACITY_KEY = 'shuffle_capacity_upgrades';

/**
 * The master switch over the whole capacity feature. Off means every family
 * plays vanilla and the pond keeps its native purchase loop, the shape the
 * game shipped with. On for a new profile and for every snapshot written
 * before the switch existed, so a stored placement keeps its meaning.
 * Not a family row, so familyOfOptionKey answers undefined for it.
 */
const CAPACITY_ENABLED_KEY = 'capacity_upgrades_enabled';

/**
 * The one switch over every Custom family: true means pickups climb the
 * planned ladder in order (one progressive item per family); false means
 * each item carries its own fixed jump and the shuffle decides the order.
 * Not a family row, so familyOfOptionKey answers undefined for it.
 */
const CAPACITY_PROGRESSIVE_KEY = 'capacity_progressive';

export {
  CAPACITY_ENABLED_KEY, CAPACITY_OPTION_KEYS, CAPACITY_PROGRESSIVE_KEY, LEGACY_CAPACITY_KEY, capacityFieldsOf,
  capacityKeyOf, familyOfOptionKey,
};
export type { CapacityField };
