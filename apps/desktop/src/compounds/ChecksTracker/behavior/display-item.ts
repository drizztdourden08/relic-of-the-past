/* @layer renderer-components @kind logic */
import { getItem } from '@rotp/game-data';
import type { ItemId } from '@rotp/game-data';
import { itemName } from '@app/game/record-text';
import type { DisplayItem } from './display-item.type';

const displayItemOf = (item: ItemId | undefined, foreignItem: string | undefined): DisplayItem => {
  const shownId = foreignItem === undefined ? item : undefined;
  return { shownId, name: foreignItem ?? (shownId ? itemName(getItem(shownId)) : undefined) };
};

export { displayItemOf };
