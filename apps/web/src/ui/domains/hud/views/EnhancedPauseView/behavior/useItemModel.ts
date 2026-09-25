/* @layer renderer-hud @kind hook */
/**
 * The item screen's cells and the name of whatever the cursor is on.
 *
 * `buildItemCells` does the hard part (twenty-four cells out of twenty save
 * slots, the split tool/instrument pair, the four bottles, and the tier-one
 * silhouette an unowned cell wears). This only splits its answer into the two
 * boxes the screen draws and looks up the selected cell's name.
 *
 * The name comes from the profile's own language set through the same hook the
 * original menu uses, then through the same fold-and-wrap: the panel composes
 * text from one sprite per character and can only draw A-Z, 0-9, space and '&',
 * so a translated name is folded to that set instead of left half-blank.
 */
import { useMemo } from 'react';
import { ITEM_SLOT_COUNT, buildItemCells } from '@shared/game/logic/pause';
import { useGameUIStore } from '@app/stores/game-ui-store';
import { useLocalizedNames } from '../../PauseMenuView/behavior/useLocalizedNames';
import { wrapName } from '../../PauseMenuView/behavior/wrap-name';
import type { ItemCell, PauseNameKey } from '@shared/game/logic/pause';
import type { ItemsSection } from '../../../compounds/PauseItemsScreen';

interface ItemModel {
  /** All twenty-four cells, in hud-item order, which is what the reducer indexes. */
  cells: readonly ItemCell[];
  /** The first twenty, for the grid. */
  items: readonly ItemCell[];
  /** The last four, for the bottle row. */
  bottles: readonly ItemCell[];
  /** The selected cell's name, folded and broken onto the panel's grid. */
  nameLines: readonly string[];
}

/** Cursor position to cell index: the bottles follow the twenty item cells. */
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
export type { ItemModel };
