/* @layer shared-game @kind logic */
/**
 * items.json: every item a multiworld can carry, with its Archipelago id and name and the class
 * the pool gives it under the default options. A profile's own world model restates the class of
 * every item it really uses (a wallet upgrade is progression only while the wallet starts below
 * the dearest price), so this class is the fallback for an item the model does not name. The
 * story events are no items here: the loader creates them (export-regions.ts).
 */
import { AP_ITEM_IDS, AP_ITEM_NAMES } from '../ap-ids.data';
import { USEFUL_ITEMS } from '../../world/pool/item-classes.data';
import { isProgressionUnder } from '../../world/pool/progression-class';
import { baselineValues } from '../../world/options.data';
import { capacityProfileFromSnapshot } from '../../world/capacity/capacity-profile-from-snapshot';
import type { ItemKey } from '../../world/item-ids.data';
import type { ExportedItem, ItemClass } from './export.type';

const exportItems = (): ExportedItem[] => {
  const isProgression = isProgressionUnder(
    capacityProfileFromSnapshot({ schema: 'ap-options-v2', values: { ...baselineValues } }),
  );
  const classOf = (key: ItemKey): ItemClass => {
    if (isProgression(key)) return 'progression';
    return USEFUL_ITEMS.has(key) ? 'useful' : 'filler';
  };
  const items = (Object.entries(AP_ITEM_IDS) as [ItemKey, number][]).map(([key, id]): ExportedItem => ({
    key, id, name: AP_ITEM_NAMES[id], classification: classOf(key),
  }));
  const names = new Set<string>();
  for (const item of items) {
    if (names.has(item.name)) throw new Error(`two items named ${item.name}`);
    names.add(item.name);
  }
  return items;
};

export { exportItems };
