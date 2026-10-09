/* @layer bridge-wasm @kind logic */
import { findOne } from '@shared/game/data';
import type { ItemRecord } from '@shared/game/data';

const itemByName = (name: string): ItemRecord | undefined =>
  findOne('item', (item) => item.name === name);

export { itemByName };
