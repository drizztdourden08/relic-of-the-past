/* @layer renderer-components @kind logic */
import { getItem } from '@rotp/game-data';
import type { ItemId } from '@rotp/game-data';
import type { DisplayItem } from './display-item.type';

const displayItemOf = (item: ItemId | undefined, foreignItem: string | undefined): DisplayItem => {
  const shownId = foreignItem === undefined ? item : undefined;
  return { shownId, name: foreignItem ?? (shownId ? getItem(shownId).name : undefined) };
};

export { displayItemOf };
