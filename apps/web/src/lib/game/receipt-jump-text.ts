/* @layer bridge-wasm @kind logic */
/**
 * The session line for a capacity upgrade addressed by its VIRTUAL RECEIVE ID
 * — the form the delivery labels and grant logs hold. The step families carry
 * the jump in the id; a wallet slot resolves through the session's jump table
 * (the same table the core climbs by), so the text can never disagree with
 * the grant. Never a running total: see capacity-jump-text.ts. A progressive
 * id carries no jump of its own — its label names the next planned step.
 */

import { isProgressiveCapacityReceiveId, upgradeFamilyOfReceiveId, upgradeJumpOfReceiveId } from '@shared/game/data';
import { capacityFamilyLabel, capacityJumpText } from '@shared/randomizer/receipt-text/capacity-jump-text';
import { sessionWalletTable } from './randomizer-client/session-wallet-table';

/** "Explosives +2 tiers" · "Wallet +500 rupees"; undefined for a non-upgrade id or an unarmed wallet slot. */
const receiptJumpText = (
  receiveId: number, walletTable: readonly number[] = sessionWalletTable(),
): string | undefined => {
  const family = upgradeFamilyOfReceiveId(receiveId);
  if (family === undefined) return undefined;
  if (isProgressiveCapacityReceiveId(receiveId)) return `${capacityFamilyLabel(family)} next step`;
  const jump = upgradeJumpOfReceiveId(receiveId, walletTable);
  if (jump === undefined) return undefined;
  return `${capacityFamilyLabel(family)} +${capacityJumpText(family, jump)}`;
};

export { receiptJumpText };
