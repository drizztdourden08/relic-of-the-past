/* @layer shared-game @kind types */
import type { ItemId } from '@rotp/game-data';
import type { LocationKey } from '../location-key';
import type { CapacityFamilyId } from '../capacity/capacity-profile.type';
import type { ProgressiveFamilyId } from '../progressive/progressive.type';

type PondId = 'capacity' | 'wishing' | 'cursed';

type PondHardFamily = Extract<CapacityFamilyId, 'explosives' | 'projectiles'>;

type PondSlotLock =
  | { kind: 'hard'; family: PondHardFamily }
  | { kind: 'tier'; family: ProgressiveFamilyId; tier: ItemId }
  | { kind: 'none' };

interface PondSlot {
  key: LocationKey;
  rung: number;
  ladder?: string;
  lock: PondSlotLock;
  vanillaGrant?: ItemId;
}

interface PondInstance {
  id: PondId;
  label: string;
  slots: readonly [PondSlot, PondSlot];
}

export type { PondHardFamily, PondId, PondInstance, PondSlot, PondSlotLock };
