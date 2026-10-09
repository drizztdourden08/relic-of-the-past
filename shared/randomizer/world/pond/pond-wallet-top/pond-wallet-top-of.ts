/* @layer shared-game @kind logic */
import { WALLET } from '../../capacity/capacity-family';
import { reachableTopOf } from '../../capacity/reachable-top';
import type { CapacityProfile } from '../../capacity/capacity-profile.type';

const pondWalletTopOf = (profile: CapacityProfile): number => reachableTopOf(WALLET, profile);

export { pondWalletTopOf };
