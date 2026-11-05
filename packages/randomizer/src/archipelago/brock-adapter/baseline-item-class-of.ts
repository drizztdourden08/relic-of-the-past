/* @layer shared-game @kind logic */
import { AP_ITEM_IDS } from '../ap-ids.constants';
import { USEFUL_ITEMS } from '../../world/pool/item-classes.constants';
import { isProgressionUnder } from '../../world/pool/progression-class';
import { baselineValues } from '../../world/options';
import { capacityProfileFromSnapshot } from '../../world/capacity/capacity-profile-from-snapshot';
import type { ItemClass } from '@drizztdourden08/brock-randomizer/archipelago';
import type { ItemKey } from '../../world/item-ids';

let isProgression: ((item: ItemKey) => boolean) | undefined;

const isItemKey = (key: string): key is ItemKey => key in AP_ITEM_IDS;

const baselineItemClassOf = (key: string): ItemClass => {
  if (!isItemKey(key)) throw new Error(`item has no Archipelago id: ${key}`);
  isProgression ??= isProgressionUnder(
    capacityProfileFromSnapshot({ schema: 'ap-options-v2', values: { ...baselineValues } }),
  );
  if (isProgression(key)) return 'progression';
  return USEFUL_ITEMS.has(key) ? 'useful' : 'filler';
};

export { baselineItemClassOf };
