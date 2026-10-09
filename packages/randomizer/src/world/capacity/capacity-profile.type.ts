/* @layer shared-game @kind types */
import type { CapacityFamilyId, RegionId } from '@rotp/game-data';
import type { ItemKey } from '../item-ids.data';

type CapacityMode = 'vanilla' | 'vanilla-in-pool' | 'custom';

type CurveId = 'equal' | 'front' | 'ramp' | 'reverse-fib' | 'geometric';

type CurveShape = { curve: CurveId } | { curve: 'free'; jumps: readonly number[] };

interface CustomFamilySetting {
  mode: 'custom';
  start: number;
  max: number;
  count: number;
  shape: CurveShape;
}

type FamilySetting =
  | { mode: 'vanilla' }
  | { mode: 'vanilla-in-pool' }
  | CustomFamilySetting;

type WalletSetting = Exclude<FamilySetting, { mode: 'vanilla-in-pool' }>;

interface CapacityProfile {
  explosives: FamilySetting;
  projectiles: FamilySetting;
  meter: FamilySetting;
  wallet: WalletSetting;
}

interface FamilyPlan {
  jumps: readonly number[];
  ladder: readonly number[];
  items: readonly ItemKey[];
  spotIsCheck: boolean;
  progressive: boolean;
}

interface CapacityPoolCounts {
  perFamily: Record<CapacityFamilyId, number>;
  poolDelta: number;
}

interface ParsedCapacityProfile {
  profile: CapacityProfile;
  notes: readonly string[];
}

interface CapacityShop {
  region: RegionId;
  price: number;
}

export type {
  CapacityFamilyId,
  CapacityMode,
  CapacityPoolCounts,
  CapacityProfile,
  CapacityShop,
  CurveId,
  CurveShape,
  CustomFamilySetting,
  FamilyPlan,
  FamilySetting,
  ParsedCapacityProfile,
  WalletSetting,
};
