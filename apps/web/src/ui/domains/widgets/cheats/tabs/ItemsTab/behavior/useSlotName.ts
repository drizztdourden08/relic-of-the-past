/* @layer renderer-widgets @kind hook */
/**
 * What the name panel shows for one slot: the localized name the pause menu would draw for an
 * owned grid slot, the first tier's name for an unowned one, and the tier label for the
 * equipment and ability slots, whose names come from the item records.
 */
import { useCallback } from 'react';
import { useGameUIStore } from '@app/stores/game-ui-store';
import { getSlotSprite } from '@domains/hud/composites/PauseItemSlot';
import { useLocalizedNames } from '@domains/hud/views/PauseMenuView/behavior/useLocalizedNames';
import { itemNameKeyForSlot } from '@domains/hud/views/PauseMenuView/behavior/item-name-key';
import { wrapName } from '@domains/hud/views/PauseMenuView/behavior/wrap-name';
import { BOTTLE_SLOT_INDEX } from '../ItemsTab.constants';
import { isSlotOwned, slotValueOf } from './slot-value';
import type { SlotName, SlotSpec } from '../ItemsTab.type';

/** The bottle-index slot draws its selected bottle's contents; an unowned one draws an empty bottle. */
const EMPTY_BOTTLE = 2;

const EMPTY_NAME: SlotName = { lines: [''], sprite: null, owned: false };

const useSlotName = (specs: Map<number, SlotSpec>) => {
  const items = useGameUIStore((s) => s.inventory.items);
  const bottles = useGameUIStore((s) => s.inventory.bottles);
  const equipment = useGameUIStore((s) => s.equipment);
  const { itemName, bottleName } = useLocalizedNames();

  const gridName = useCallback((slot: number): SlotName => {
    const owned = (items[slot] ?? 0) > 0;
    // An unowned slot is named as if it held its first tier, so the panel still says what it is.
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
