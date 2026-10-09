/* @layer shared-game @kind logic */
import { walletSlotOfJump } from '../wallet-jump-table';
import type { CapacityFamilyId } from '../capacity-family.type';
import { STEP_RANGES, WALLET_VIRT_FIRST } from './upgrade-receive-id.constants';

const upgradeReceiveIdOf = (
  family: CapacityFamilyId, jump: number, walletTable: readonly number[] = [],
): number => {
  if (family === 'wallet') {
    const slot = walletSlotOfJump(walletTable, jump);
    if (slot === undefined) throw new Error(`wallet jump ${jump} is not in the session's jump table`);
    return WALLET_VIRT_FIRST + slot;
  }
  const range = STEP_RANGES[family];
  if (!Number.isInteger(jump) || jump < 1 || range.first + jump - 1 > range.last) {
    throw new Error(`${family}: no virtual id carries a jump of ${jump}`);
  }
  return range.first + jump - 1;
};

export { upgradeReceiveIdOf };
