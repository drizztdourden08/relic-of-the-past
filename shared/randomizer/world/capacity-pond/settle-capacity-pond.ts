/* @layer shared-game @kind logic */
import { alignFamilies } from './align-families';
import { fedFamiliesOf } from './fed-families-of';
import { isPondActive } from './is-pond-active';
import { pondDemandOf } from './pond-demand-of';
import { pondForDemand } from './pond-for-demand';
import { profilePondDemand } from './profile-pond-demand';
import type { CapacityPondAuthority, CapacityPondSelection, PondFedFamily } from './capacity-pond-rule.type';

const movedFamily = (authority: CapacityPondAuthority, fed: readonly PondFedFamily[]): PondFedFamily | undefined =>
  (fed as readonly string[]).includes(authority) ? authority as PondFedFamily : undefined;

const settleCapacityPond = (selection: CapacityPondSelection, authority: CapacityPondAuthority): CapacityPondSelection => {
  const { capacity, pond, retroBow } = selection;
  const fed = fedFamiliesOf(retroBow);
  if (authority === 'pond') return { ...selection, capacity: alignFamilies(capacity, fed, isPondActive(pond)) };
  const moved = movedFamily(authority, fed);
  const demand = moved === undefined ? profilePondDemand(capacity, fed) : pondDemandOf(capacity[moved]);
  const settled = pondForDemand(pond, demand);
  return { ...selection, capacity: alignFamilies(capacity, fed, isPondActive(settled), moved), pond: settled };
};

export { settleCapacityPond };
