/* @layer shared-game @kind logic */
import { NO_WALLET_FLOOR } from './wallet-floor/wallet-floor.constants';
import { maxRungFloorOf } from './max-rung-floor-of';
import type { CapacityFamily } from './capacity-family';
import type { WalletFloor } from './wallet-floor/wallet-floor.type';

const heldMaxRungOf = (family: CapacityFamily, maxRung: number, walletFloor: WalletFloor = NO_WALLET_FLOOR): number =>
  Math.max(maxRung, maxRungFloorOf(family, walletFloor));

export { heldMaxRungOf };
