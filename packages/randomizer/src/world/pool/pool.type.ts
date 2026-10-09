/* @layer shared-game @kind types */
import type { ItemKey } from '../item-ids.data';
import type { CapacityFamilyId, FamilyPlan } from '../capacity/capacity-profile.type';

type FillerPicker = (count: number) => number;

type BottlePicker = (choices: readonly ItemKey[]) => ItemKey;

type WeaponPicker = (choices: readonly ItemKey[]) => ItemKey;

type WeaponFilter = (item: ItemKey) => boolean;

type CapacityPlans = Readonly<Record<CapacityFamilyId, FamilyPlan>>;

interface MeterPoolItems {
  magicRow: ItemKey[];
  overflow: ItemKey[];
}

interface PoolAccounting {
  locations: number;
  spots: number;
  open: number;
  items: number;
  fixed: number;
  prizes: number;
  lockedVanilla: number;
  filler: number;
  upgrades: number;
}

interface PoolImpact {
  locations: number;
  items: number;
  note: string;
}

interface DungeonItemSets {
  dungeonItems: Map<string, readonly ItemKey[]>;
  escaped: ItemKey[];
}

export type {
  BottlePicker, CapacityPlans, DungeonItemSets, FillerPicker, MeterPoolItems, PoolAccounting, PoolImpact,
  WeaponFilter, WeaponPicker,
};
