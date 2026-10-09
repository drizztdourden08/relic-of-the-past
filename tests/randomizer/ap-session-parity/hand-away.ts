/* @layer tests @kind helper */
import { FOREIGN_ITEM_KEY } from '@shared/randomizer/archipelago/foreign-item';
import { AP_LOCATION_IDS } from '@shared/randomizer/archipelago/ap-ids.data';
import type { LocationKey } from '@shared/randomizer/world/location-key';
import type { Placement } from '@shared/randomizer/world/fill/placement.type';
import type { FakeRoom } from '../ap-fake-server';
import { OTHER_SLOT } from './parity-cases.data';

const handAway = (placement: Placement, room: FakeRoom, spots: readonly LocationKey[]): Placement => {
  const locations = { ...placement.locations };
  for (const spot of spots) {
    locations[spot] = FOREIGN_ITEM_KEY;
    const scout = room.placements[AP_LOCATION_IDS[spot] ?? -1];
    if (scout !== undefined) scout.player = OTHER_SLOT;
  }
  room.players.push({ team: 0, slot: OTHER_SLOT, alias: 'Zelda', name: 'Zelda' });
  room.slotInfo[OTHER_SLOT] = { name: 'Zelda', game: room.slotInfo[1].game, type: 1, group_members: [] };
  return { ...placement, locations };
};

export { handAway };
