/* @layer tests @kind helper */
import { AP_GAME, AP_ITEM_IDS, AP_LOCATION_IDS } from '@rotp/randomizer';
import type { ItemKey, LocationKey, Placement, RandomizerOptionsSnapshot, DeliverableLists, ApNetworkItem } from '@rotp/randomizer';
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
