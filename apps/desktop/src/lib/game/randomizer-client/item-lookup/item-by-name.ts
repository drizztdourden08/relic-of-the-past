/* @layer bridge-wasm @kind logic */
import { findOne } from '@rotp/game-data';
import type { ItemRecord } from '@rotp/game-data';

const itemByName = (name: string): ItemRecord | undefined =>
  findOne('item', (item) => item.name === name);

export { itemByName };
