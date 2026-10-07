/* @layer shared-game @kind logic */
/**
 * The most a pond may ask of each counted currency under one capacity profile:
 * what the wallet, the bomb bag and the quiver can reach at their biggest
 * (capacity/reachable-top.ts). The settings cut every range control at these,
 * so a slider reaches exactly as high as the profile allows and no higher. No
 * profile reads as a vanilla file: 999 rupees, ten bombs, thirty arrows.
 */
import { EXPLOSIVES, PROJECTILES, WALLET } from '../capacity/capacity-family';
import { reachableTopOf } from '../capacity/reachable-top';
import type { CapacityFamily } from '../capacity/capacity-family';
import type { CapacityProfile } from '../capacity/capacity-profile.type';
import type { PondAskCurrency } from './pond-ask.type';

type PondCeilings = Readonly<Record<PondAskCurrency, number>>;

const topOf = (family: CapacityFamily, capacity: CapacityProfile | undefined): number =>
  (capacity === undefined ? family.ladder[family.vanillaRung] : reachableTopOf(family, capacity));

const pondCeilingsOf = (capacity?: CapacityProfile): PondCeilings => ({
  rupees: topOf(WALLET, capacity),
  bombs: topOf(EXPLOSIVES, capacity),
  arrows: topOf(PROJECTILES, capacity),
});

const VANILLA_POND_CEILINGS: PondCeilings = pondCeilingsOf();

export { VANILLA_POND_CEILINGS, pondCeilingsOf };
export type { PondCeilings };
