/* @layer shared-game @kind logic */
/**
 * What a pond's own region holds, in the order the pond hands it over.
 *
 * A pond's room is the one region whose locations are more than its check rows: a setting
 * lets the pond sell a ladder as long as it asks for, and only the first two rungs are spots
 * the unmodified game has. So the region's list is the whole ladder, with the pond's own
 * records sitting at the rungs they are (pond-rungs.ts) and every rung above them a slot key.
 *
 * The capacity pond's pair heads two NAMED ladders, so it sits ahead of the plain numbered
 * series instead of inside it.
 *
 * The region is read off the pond's own records, never a name: a slot record says which
 * region it sits in, the same way every other check row does.
 */
import { getCheck } from '@shared/game/data';
import { POND_INSTANCES } from './pond-instances';
import { POND_RUNGS_BY_ID } from './pond-rungs';
import { capacityPondSpots } from '../capacity/capacity-spots';
import type { CheckId, RegionId } from '@shared/game/data/types/ids';
import type { LocationKey } from '../location-key';
import type { PondInstance } from './pond-instance.type';

/** The region a pond stands in: the one its own slot records are filed under. */
const regionOfPond = (pond: PondInstance): RegionId => {
  const region = getCheck(pond.slots[0].key as CheckId).regionId;
  if (region === undefined) throw new Error(`pond slot with no region: ${pond.slots[0].key}`);
  return region;
};

const locationsOfPond = (pond: PondInstance): readonly LocationKey[] =>
  (pond.id === 'capacity'
    ? [...capacityPondSpots(), ...POND_RUNGS_BY_ID.capacity]
    : POND_RUNGS_BY_ID[pond.id]);

const POND_REGION_LOCATIONS: ReadonlyMap<RegionId, readonly LocationKey[]> = new Map(
  POND_INSTANCES.map((pond) => [regionOfPond(pond), locationsOfPond(pond)]),
);

export { POND_REGION_LOCATIONS };
