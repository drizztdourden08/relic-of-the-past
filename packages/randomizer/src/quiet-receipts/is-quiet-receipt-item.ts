/* @layer bridge-wasm @kind logic */
import { gateWord5Now } from '../gate-word-5/gate-word-5-now';
import { QUIET_RECEIPT_BITS } from '../gate-word-5/gate-word-5.constants';
import { sessionGateArmed } from '@rotp/game-core';
import { RECEIPT_KIND } from './quiet-receipts.constants';

const isQuietReceiptItem = (itemId: number): boolean => {
  const kind = RECEIPT_KIND.get(itemId);
  if (kind === undefined) return false;
  const arrowIsTheQuiver = kind === 'arrows' && sessionGateArmed('retroBow');
  if (arrowIsTheQuiver) return false;
  return (gateWord5Now() & QUIET_RECEIPT_BITS[kind]) !== 0;
};

export { isQuietReceiptItem };
