/* @layer bridge-wasm @kind logic */
import { isGrantableReceiveId } from '@rotp/game-data';
import { log } from '../../log-bus';

const isGrantable = (itemId: number): boolean => {
  if (isGrantableReceiveId(itemId)) return true;
  log.error(`[Delivery] Refused item id 0x${itemId.toString(16)}: outside the native grant table`);
  return false;
};

export { isGrantable };
