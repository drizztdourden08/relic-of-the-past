/* @layer renderer-hud @kind hook */
import { useMemo } from 'react';
import type { PauseMenuData } from '../../../hooks/hooks.type';
import { BOTTLE_ITEM_SLOT } from '../PauseMenuView.constants';
import type { MenuSelection } from '../PauseMenuView.type';
import { derivedAbilityFlags } from './derived-ability-flags';
import { displayItemsOf } from './display-items';
import { itemNameKeyForSlot } from './item-name-key';
import { selectedSpriteOf } from './selected-sprite';
import { useLocalizedNames } from './useLocalizedNames';
import { wrapName } from './wrap-name';

const useMenuSelection = (data: PauseMenuData): MenuSelection => {
  const bottleSlot = data.items[BOTTLE_ITEM_SLOT] ?? 0;
  const selectedSaveIdx = data.equippedY > 0 ? data.equippedY - 1 : -1;
  const isBottleSelected = selectedSaveIdx === BOTTLE_ITEM_SLOT && bottleSlot > 0;

  const { itemName, bottleName } = useLocalizedNames();
  const selectedItemName = useMemo(() => {
    if (isBottleSelected) return bottleName(data.bottles[(data.items[BOTTLE_ITEM_SLOT] ?? 0) - 1] ?? 0);
    const key = itemNameKeyForSlot(selectedSaveIdx, data.items);
    return key ? itemName(key.recordId, key.tier) : '';
  }, [isBottleSelected, bottleName, itemName, data.bottles, data.items, selectedSaveIdx]);
  const nameLines = useMemo(() => wrapName(selectedItemName), [selectedItemName]);

  return {
    displayItems: displayItemsOf(data, bottleSlot),
    selectedSaveIdx,
    isBottleSelected,
    bottleSlot,
    nameLines,
    itemSprite: selectedSpriteOf(data, selectedSaveIdx, isBottleSelected, bottleSlot),
    abilityFlags: derivedAbilityFlags(data),
  };
};

export { useMenuSelection };
