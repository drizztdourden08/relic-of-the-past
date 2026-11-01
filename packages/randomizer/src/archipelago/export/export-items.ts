/* @layer shared-game @kind logic */
import { AP_ITEM_IDS, AP_ITEM_NAMES } from '../ap-ids.constants';
import { USEFUL_ITEMS } from '../../world/pool/item-classes.constants';
import { isProgressionUnder } from '../../world/pool/progression-class';
import { baselineValues } from '../../world/options';
import { capacityProfileFromSnapshot } from '../../world/capacity/capacity-profile-from-snapshot';
import type { ItemKey } from '../../world/item-ids';
import type { ExportedItem, ItemClass } from './export.type';

const exportItems = (): ExportedItem[] => {
  const isProgression = isProgressionUnder(
    capacityProfileFromSnapshot({ schema: 'ap-options-v2', values: { ...baselineValues } }),
  );
  const classOf = (key: ItemKey): ItemClass => {
    if (isProgression(key)) return 'progression';
    return USEFUL_ITEMS.has(key) ? 'useful' : 'filler';
  };
  const items = (Object.entries(AP_ITEM_IDS) as [ItemKey, number][]).map(([key, id]): ExportedItem => {
    const name = AP_ITEM_NAMES[id];
    if (name === undefined) throw new Error(`item has no Archipelago name: ${key}`);
    return { key, id, name, classification: classOf(key) };
  });
  const names = new Set<string>();
  for (const item of items) {
    if (names.has(item.name)) throw new Error(`two items named ${item.name}`);
    names.add(item.name);
  }
  return items;
};

export { exportItems };
