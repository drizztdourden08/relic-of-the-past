/* @layer shared-game @kind logic */
import { getItemByGameId } from '../../../data';

const itemLabel = (itemId: number): string =>
  getItemByGameId({ receiveItemId: itemId })?.name ?? `item 0x${itemId.toString(16)}`;

export { itemLabel };
