/* @layer bridge-wasm @kind logic */
import { getItem } from '@rotp/game-data';

const assignedItemName = (itemId: string): string => getItem(itemId).name;

export { assignedItemName };
