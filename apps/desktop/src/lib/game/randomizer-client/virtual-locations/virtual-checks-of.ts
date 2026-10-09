/* @layer bridge-wasm @kind logic */
import { shopSlotLocationOf } from '@shared/randomizer/world/shops/shop-slots';
import { KEY_DROP_LOCATIONS } from '@shared/randomizer/world/scope-tables';
import { checkIdOfLocation } from '@shared/randomizer/world/location-record';
import { locationDisplayName } from '@shared/randomizer/world/display-names/location-display-name';
import { getCheck } from '@rotp/game-data';
import { virtualCheckIdOf } from './virtual-check-id-of';
import { virtualChecksCache } from './virtual-checks-cache';
import type { LocationKey } from '@shared/randomizer/world/location-key';
import type { Placement } from '@shared/randomizer/world/fill/placement.type';
import type { CheckRecord, ItemId, ScreenId } from '@rotp/game-data';

const shopScreenFor = (location: LocationKey): ScreenId | undefined => {
  const checkId = shopSlotLocationOf(location)?.slot.checkId;
  return checkId === undefined ? undefined : getCheck(checkId).screenId;
};

const vanillaItemIdsOf = (location: LocationKey): ItemId[] => {
  const itemId = shopSlotLocationOf(location)?.slot.vanillaItem ?? KEY_DROP_LOCATIONS.get(location);
  return itemId === undefined ? [] : [itemId];
};

const virtualChecksOf = (placement: Placement): CheckRecord[] => {
  const cached = virtualChecksCache.entry;
  if (cached?.placement === placement) return cached.records;
  const records: CheckRecord[] = [];
  for (const where of Object.keys(placement.locations)) {
    const location = where as LocationKey;
    if (checkIdOfLocation(location) !== undefined) continue;
    const screenId = shopScreenFor(location);
    records.push({
      id: virtualCheckIdOf(location),
      gameId: {},
      kind: shopSlotLocationOf(location) === undefined ? 'pond-slot' : 'shop-slot',
      screenId,
      name: locationDisplayName(location),
      vanillaItemIds: vanillaItemIdsOf(location),
      isGuaranteedReward: true,
    });
  }
  virtualChecksCache.entry = { placement, records };
  return records;
};

export { virtualChecksOf };
