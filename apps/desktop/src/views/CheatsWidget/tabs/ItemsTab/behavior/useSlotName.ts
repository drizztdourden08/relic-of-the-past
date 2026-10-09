/* @layer renderer-widgets @kind hook */
import { useCallback } from 'react';
import { useGameUIStore } from '@app/stores/game-ui-store';
import { getSlotSprite } from '@app/composites/PauseItemSlot';
import { useLocalizedNames } from '@app/views/PauseMenuView/behavior/useLocalizedNames';
import { itemNameKeyForSlot } from '@app/views/PauseMenuView/behavior/item-name-key';
import { wrapName } from '@app/views/PauseMenuView/behavior/wrap-name';
import { BOTTLE_SLOT_INDEX, EMPTY_BOTTLE, EMPTY_NAME } from '../ItemsTab.constants';
import { isSlotOwned, slotValueOf } from './slot-value';
import type { SlotName, SlotSpec } from '../ItemsTab.type';

const useSlotName = (specs: Map<number, SlotSpec>) => {
  const items = useGameUIStore((s) => s.inventory.items);
  const bottles = useGameUIStore((s) => s.inventory.bottles);
  const equipment = useGameUIStore((s) => s.equipment);
  const { itemName, bottleName } = useLocalizedNames();

  const gridName = useCallback((slot: number): SlotName => {
    const owned = (items[slot] ?? 0) > 0;
    const probe = owned ? items : items.map((value, i) => (i === slot ? 1 : value));
    const key = itemNameKeyForSlot(slot, probe);
    const keyName = key ? itemName(key.recordId, key.tier) : '';
    if (slot === BOTTLE_SLOT_INDEX) {
      const content = owned ? (bottles[items[slot] - 1] ?? 0) : EMPTY_BOTTLE;
      const name = owned ? bottleName(content) : keyName;
      return { lines: wrapName(name), sprite: getSlotSprite(slot, content), owned };
    }
    return { lines: wrapName(keyName), sprite: getSlotSprite(slot, probe[slot]), owned };
  }, [items, bottles, itemName, bottleName]);

  const equipName = useCallback((spec: SlotSpec): SlotName => {
    const value = slotValueOf(spec.slot, items, equipment);
    const owned = isSlotOwned(spec.slot, value);
    const shown = owned ? spec.tiers.find((t) => t.value === value) : spec.tiers.find((t) => t.value > 0);
    if (!shown) return EMPTY_NAME;
    return { lines: wrapName(shown.label), sprite: shown.sprite, owned };
  }, [items, equipment]);

  return useCallback((slot: number | null): SlotName => {
    if (slot === null) return EMPTY_NAME;
    const spec = specs.get(slot);
    if (!spec) return EMPTY_NAME;
    return spec.place === 'grid' ? gridName(slot) : equipName(spec);
  }, [specs, gridName, equipName]);
};

export { useSlotName };
