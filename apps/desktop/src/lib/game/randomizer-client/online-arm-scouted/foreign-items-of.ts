/* @layer bridge-wasm @kind logic */
import type { LocationKey } from '@shared/randomizer/world/location-key';
import type { ForeignItem } from '../foreign-item-line';
import type { ScoutedInput } from '../online-core.type';

const foreignItemsOf = (input: ScoutedInput): Map<LocationKey, ForeignItem> => {
  const items = new Map<LocationKey, ForeignItem>();
  for (const scout of input.scouts) {
    const key = input.maps.keyByLocationId.get(scout.location);
    if (key === undefined || scout.player === input.slot) continue;
    items.set(key, {
      owner: input.playerName(scout.player),
      item: input.itemName(scout.item, scout.player),
      game: input.gameOf(scout.player),
    });
  }
  return items;
};

export { foreignItemsOf };
