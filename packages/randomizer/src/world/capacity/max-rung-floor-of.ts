/* @layer shared-game @kind logic */
import { FINAL_FIGHT_SILVER_HITS } from '../final-fight.constants';
import { NO_WALLET_FLOOR } from './wallet-floor/wallet-floor.constants';
import type { CapacityFamily } from './capacity-family';
import type { WalletFloor } from './wallet-floor/wallet-floor.type';

const maxRungFloorOf = (family: CapacityFamily, walletFloor: WalletFloor = NO_WALLET_FLOOR): number => {
  if (family.id === 'wallet') return walletFloor.rung;
  if (family.id !== 'projectiles') return 0;
  const rung = family.ladder.findIndex((value) => value >= FINAL_FIGHT_SILVER_HITS);
  return rung === -1 ? family.ladder.length - 1 : rung;
};

export { maxRungFloorOf };
