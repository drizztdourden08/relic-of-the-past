/* @layer bridge-wasm @kind logic */
import { isProgressiveCapacityReceiveId, upgradeFamilyOfReceiveId, upgradeJumpOfReceiveId } from '@rotp/game-data';
import { capacityFamilyLabel, capacityJumpText } from '@shared/randomizer/receipt-text/capacity-jump-text';
import { sessionWalletTable } from './randomizer-client/session-wallet-table';

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
