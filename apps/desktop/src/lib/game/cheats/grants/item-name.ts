/* @layer bridge-wasm @kind logic */
import { getItemByGameId } from '@rotp/game-data';

const itemName = (itemId: number): string => getItemByGameId({ receiveItemId: itemId })?.name ?? `Unknown Item #${itemId}`;

export { itemName };
