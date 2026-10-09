/* @layer shared-game @kind logic */
import { FINAL_FIGHT_SILVER_HITS } from '../final-fight.constants';
import { NO_WALLET_FLOOR } from './wallet-floor/wallet-floor.constants';
import type { CapacityFamily } from './capacity-family';
import type { WalletFloor } from './wallet-floor/wallet-floor.type';

const maxFloorReasonOf = (
  family: CapacityFamily, walletFloor: WalletFloor = NO_WALLET_FLOOR,
): string | undefined => {
  if (family.id === 'wallet') return walletFloor.rung > 0 ? walletFloor.reason : undefined;
  if (family.id !== 'projectiles') return undefined;
  return `the ending takes ${FINAL_FIGHT_SILVER_HITS} silver shots back to back`;
};

export { maxFloorReasonOf };
