/* @layer bridge-wasm @kind logic */
import { getItemByGameId } from '@rotp/game-data';
import { receiptJumpText } from '../foreign-items/receipt-jump-text';

const itemLabel = (itemId: number): string => getItemByGameId({ receiveItemId: itemId })?.name
  ?? receiptJumpText(itemId) ?? `Unknown Item #${itemId}`;

export { itemLabel };
