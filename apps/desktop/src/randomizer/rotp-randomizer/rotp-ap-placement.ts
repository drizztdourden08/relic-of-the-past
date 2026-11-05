/* @layer renderer-app @kind logic */
import { ROTP_AP_IDS, scoutsToPlacement } from '@rotp/randomizer';
import type { ItemKey, LocationKey, Placement, RotpSlotData } from '@rotp/randomizer';
import type { ScoutedInput } from '@drizztdourden08/brock-randomizer/archipelago';

const itemKeyOf = (id: number): ItemKey | undefined => ROTP_AP_IDS.itemKeyOf(id);

const rotpApPlacement = (slotData: RotpSlotData, input: ScoutedInput): Placement => {
  const keyById = new Map<number, LocationKey>(input.scouted.map((entry) => [entry.location, entry.locationKey as LocationKey]));
  return scoutsToPlacement({
    scouts: input.scouted.map(({ item, location, player, flags }) => ({ item, location, player, flags })),
    slot: input.slot,
    slotData,
    fallbackSeed: input.seedName,
    idToLocationKey: (id) => keyById.get(id),
    idToItemKey: itemKeyOf,
  });
};

export { rotpApPlacement };
