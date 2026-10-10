/* @layer shared-game @kind logic */
import { itemAt } from '../../../checked-access';
import { EXPLOSIVES, PROJECTILES, WALLET } from '../../capacity/capacity-family';
import { reachableTopOf } from '../../capacity/reachable-top';
import type { CapacityFamily } from '../../capacity/capacity-family';
import type { CapacityProfile } from '../../capacity/capacity-profile.type';
import type { PondCeilings } from '../pond.type';

const topOf = (family: CapacityFamily, capacity: CapacityProfile | undefined): number =>
  (capacity === undefined ? itemAt(family.ladder, family.vanillaRung) : reachableTopOf(family, capacity));

const pondCeilingsOf = (capacity?: CapacityProfile): PondCeilings => ({
  rupees: topOf(WALLET, capacity),
  bombs: topOf(EXPLOSIVES, capacity),
  arrows: topOf(PROJECTILES, capacity),
});

export { pondCeilingsOf };
