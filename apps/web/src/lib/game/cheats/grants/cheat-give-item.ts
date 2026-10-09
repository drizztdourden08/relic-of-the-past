/* @layer bridge-wasm @kind logic */
import { enqueueCheatGrant } from './enqueue-cheat-grant';

const cheatGiveItem = (itemId: number): void =>
  enqueueCheatGrant(itemId, { type: 'give_item', itemId });

export { cheatGiveItem };
