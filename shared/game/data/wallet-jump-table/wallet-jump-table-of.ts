/* @layer shared-game @kind logic */
import { WALLET_SLOT_COUNT } from './wallet-jump-table.constants';

const walletJumpTableOf = (jumps: readonly number[]): number[] => {
  const table = [...new Set(jumps)].sort((a, b) => a - b);
  if (table.length > WALLET_SLOT_COUNT) {
    throw new Error(`wallet jump table needs ${table.length} slots, ${WALLET_SLOT_COUNT} exist`);
  }
  if (table.some((jump) => !Number.isInteger(jump) || jump < 1)) {
    throw new Error(`wallet jump table holds a non-positive jump: ${table.join(',')}`);
  }
  return table;
};

export { walletJumpTableOf };
