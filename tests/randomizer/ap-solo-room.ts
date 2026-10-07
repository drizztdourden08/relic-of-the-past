/* @layer tests @kind helper */
/**
 * A local placement served as a one-player room: the slot data a world package would send
 * for it (its options, the values its generator rolled and, when given, the deliverable spots
 * its world was built with) and a scout answer holding every
 * location's item under the frozen Archipelago ids. What a solo multiworld of the same seed
 * looks like to the client.
 */
import { AP_GAME } from '@shared/randomizer/archipelago/ap-game';
import { AP_ITEM_IDS, AP_LOCATION_IDS } from '@shared/randomizer/archipelago/ap-ids.data';
import type { ItemKey } from '@shared/randomizer/world/item-ids.data';
import type { LocationKey } from '@shared/randomizer/world/location-key';
import type { Placement } from '@shared/randomizer/world/fill/placement.type';
import type { RandomizerOptionsSnapshot } from '@shared/randomizer/world/options.type';
import type { DeliverableLists } from '@shared/randomizer/world/fill/deliverable-lists';
import type { ApNetworkItem } from '@app/lib/game/randomizer-client/ap-protocol.type';
import type { FakeRoom } from './ap-fake-server';

const SLOT = 1;

const soloRoomOf = (
  placement: Placement, snapshot: RandomizerOptionsSnapshot, deliverable?: DeliverableLists,
): FakeRoom => {
  const placements: Record<number, ApNetworkItem> = {};
  for (const [where, item] of Object.entries(placement.locations) as [LocationKey, ItemKey][]) {
    const location = AP_LOCATION_IDS[where];
    const itemId = AP_ITEM_IDS[item];
    if (location === undefined || itemId === undefined) continue;
    placements[location] = { item: itemId, location, player: SLOT, flags: 0 };
  }
  return {
    games: {
      [AP_GAME]: {
        item_name_to_id: { ...AP_ITEM_IDS },
        location_name_to_id: { ...AP_LOCATION_IDS },
        checksum: `solo-${placement.seed}`,
      },
    },
    items: [],
    checked: [],
    missing: Object.keys(placements).map(Number),
    players: [{ team: 0, slot: SLOT, alias: 'Link', name: 'Link' }],
    slotInfo: { [SLOT]: { name: 'Link', game: AP_GAME, type: 1, group_members: [] } },
    slotData: {
      worldVersion: '0.1.0',
      seed: placement.seed,
      options: snapshot.values,
      medallions: placement.medallions,
      preRolled: {
        pondDemands: placement.pondDemands ?? {},
        shopPrices: placement.shopPrices ?? {},
        ...(deliverable !== undefined ? { deliverable } : {}),
      },
      deathLink: false,
    },
    placements,
    refusedUrls: new Set(),
  };
};

export { soloRoomOf };
