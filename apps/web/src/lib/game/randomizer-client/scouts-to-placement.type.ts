/* @layer bridge-wasm @kind types */
import type { DeliverableSets } from '@shared/randomizer/world/fill/fill-options-from-snapshot';
import type { ItemKey } from '@shared/randomizer/world/item-ids.data';
import type { LocationKey } from '@shared/randomizer/world/location-key';
import type { RotpSlotData } from '@shared/randomizer/archipelago/slot-data.type';
import type { ApNetworkItem } from './ap-protocol.type';

interface ScoutsToPlacementInput {
  scouts: readonly ApNetworkItem[];
  slot: number;
  slotData: RotpSlotData;
  idToLocationKey: (id: number) => LocationKey | undefined;
  idToItemKey: (id: number) => ItemKey | undefined;
  fallbackSeed?: string;
  deliverable?: DeliverableSets;
}

export type { ScoutsToPlacementInput };
