/* @layer renderer-hud @kind hook */
import { useMemo } from 'react';
import { ITEM_SLOT_COUNT, buildItemCells } from '@shared/game/logic/pause';
import { useGameUIStore } from '@app/stores/game-ui-store';
import { useLocalizedNames } from '../../PauseMenuView/behavior/useLocalizedNames';
import { wrapName } from '../../PauseMenuView/behavior/wrap-name';
import type { PauseNameKey } from '@shared/game/logic/pause';
import type { ItemsSection } from '../../../compounds/PauseItemsScreen';
import type { ItemModel } from '../EnhancedPauseView.type';

const indexOf = (section: ItemsSection, cursor: number): number =>
  (section === 'bottles' ? ITEM_SLOT_COUNT + cursor : cursor);

const useItemModel = (section: ItemsSection, cursor: number): ItemModel => {
  const items = useGameUIStore((s) => s.inventory.items);
  const bottles = useGameUIStore((s) => s.inventory.bottles);
  const { itemName, bottleName } = useLocalizedNames();

  const cells = useMemo(() => buildItemCells(items, bottles), [bottles, items]);

  const nameOf = (key: PauseNameKey | undefined): string => {
    if (!key) return '';
    return key.kind === 'bottle' ? bottleName(key.value) : itemName(key.recordId, key.tier);
  };

  const nameLines = wrapName(nameOf(cells[indexOf(section, cursor)]?.nameKey));

  return {
    cells,
    items: cells.slice(0, ITEM_SLOT_COUNT),
    bottles: cells.slice(ITEM_SLOT_COUNT),
    nameLines,
  };
};

export { useItemModel };
