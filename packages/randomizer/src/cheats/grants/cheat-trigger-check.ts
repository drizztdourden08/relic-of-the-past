/* @layer bridge-wasm @kind logic */
import { enqueueCheatGrant } from './enqueue-cheat-grant';

const cheatTriggerCheck = (roomId: number, chestIndex: number, itemId: number): void =>
  enqueueCheatGrant(itemId, { type: 'trigger_check', roomId, chestIndex, itemId });

export { cheatTriggerCheck };
