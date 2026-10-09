/* @layer bridge-wasm @kind logic */
import { getItem } from '@shared/game/data';

const assignedItemName = (itemId: string): string => getItem(itemId).name;

export { assignedItemName };
