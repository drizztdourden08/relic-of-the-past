/* @layer bridge-wasm @kind logic */
import type { ItemId } from '@rotp/game-data';
import { getItem } from '@rotp/game-data';

const itemNames = (items: ReadonlySet<ItemId>): string[] => [...items].map((id) => getItem(id).name).sort();

export { itemNames };
