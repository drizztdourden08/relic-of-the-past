/* @layer shared-game @kind types */
import type { ItemKey } from '../../item-ids.data';
import type { CapacityFamilyId } from '../capacity-profile.type';

interface CapacityFamily {
  id: CapacityFamilyId;
  label: string;
  ladder: readonly number[];
  vanillaRung: number;
  indexOf: (value: number) => number;
  referenceJumps: readonly number[];
  itemFor: (jump: number) => ItemKey;
  progressiveItem: ItemKey;
  maxJump: number;
  hasSpot: boolean;
  defaultCount: number;
}

interface CapacityFamilySpec {
  id: CapacityFamilyId;
  label: string;
  ladder: readonly number[];
  referenceJumps: readonly number[];
  hasSpot: boolean;
  defaultCount: number;
}

export type { CapacityFamily, CapacityFamilySpec };
