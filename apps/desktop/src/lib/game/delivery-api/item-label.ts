/* @layer bridge-wasm @kind logic */
import { getItemByGameId } from '@shared/game/data';
import { receiptJumpText } from '../receipt-jump-text';

const itemLabel = (itemId: number): string => getItemByGameId({ receiveItemId: itemId })?.name
  ?? receiptJumpText(itemId) ?? `Unknown Item #${itemId}`;

export { itemLabel };
