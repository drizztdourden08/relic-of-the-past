/* @layer bridge-wasm @kind logic */
import { releaseSlot } from '../arrival-ring';
import { sessionPool } from './session-pool';

const releaseSessionReceiptMessage = (messageId: number): void => {
  if (sessionPool.baseId !== null) releaseSlot(sessionPool.arrivals, messageId - sessionPool.baseId);
};

export { releaseSessionReceiptMessage };
