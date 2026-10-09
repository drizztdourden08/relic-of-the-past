/* @layer shared-game @kind logic */
import { pondPlanOf } from '../pond/pond-plan';
import { POND_VANILLA_PRICE } from '../pond/pond-ladder.data';
import { FED_FAMILY_LABEL, POND_FED_FAMILIES } from './capacity-pond.constants';
import type { CapacityProfile } from '../capacity/capacity-profile.type';
import type { PondPlan, PondSetting } from '../pond/pond-profile.type';
import type { CapacityPondSelection } from './capacity-pond-rule.type';

const countPhrase = (count: number, unit: string): string => `${count} ${unit}${count === 1 ? '' : 's'}`;

const priceClause = (plan: PondPlan): string => {
  const prices = plan.throws.map((entry) => entry.price);
  const low = Math.min(...prices);
  const high = Math.max(...prices);
  return low === high ? `at ${countPhrase(low, 'rupee')} each` : `from ${low} to ${high} rupees`;
};

const prizeClause = (plan: PondPlan, verb: string): string => {
  const prizes = plan.locations.length;
  if (prizes === 0) return `None ${verb} a shuffled item, so the pond is not a check`;
  return `${prizes} ${verb} a shuffled item`;
};

const nativeSentence = (capacity: CapacityProfile): string => {
  const base = `The pond sells capacity levels at ${countPhrase(POND_VANILLA_PRICE, 'rupee')} a throw`;
  const allVanilla = POND_FED_FAMILIES.every((family) => capacity[family].mode === 'vanilla');
  return allVanilla ? `${base}.` : `${base}; a family moved off Vanilla gets a shuffled item in its slot.`;
};

const sellingSentence = (pond: PondSetting, capacity: CapacityProfile): string => {
  if (pond.mode === 'capacity') return nativeSentence(capacity);
  const plan = pondPlanOf(pond);
  return `${countPhrase(plan.throws.length, 'throw')} ${priceClause(plan)}. ${prizeClause(plan, 'hand over')}. `
    + `${plan.totalPrice} rupees to empty it.`;
};

const vanillaFedNames = (capacity: CapacityProfile): string[] =>
  POND_FED_FAMILIES.filter((family) => capacity[family].mode === 'vanilla').map((family) => FED_FAMILY_LABEL[family]);

const retroFamiliesSentence = (capacity: CapacityProfile): string => {
  const lead = 'Arrow upgrades are off while retro bow is on. ';
  return capacity.explosives.mode === 'vanilla'
    ? `${lead}Bomb upgrades still come from the pond.`
    : `${lead}Bomb upgrades are placed in the seed instead.`;
};

const familiesSentence = (selection: CapacityPondSelection): string => {
  const { enabled, capacity, retroBow } = selection;
  if (!enabled) return 'Capacity upgrades are off, so the pond sells bomb and arrow upgrades.';
  if (retroBow) return retroFamiliesSentence(capacity);
  const vanilla = vanillaFedNames(capacity);
  if (vanilla.length === POND_FED_FAMILIES.length) return 'Bomb and arrow upgrades still come from the pond.';
  if (vanilla.length === 0) return 'Bomb and arrow upgrades are placed in the seed; none come from the pond.';
  const [kept] = vanilla;
  const other = kept === FED_FAMILY_LABEL.explosives ? FED_FAMILY_LABEL.projectiles : FED_FAMILY_LABEL.explosives;
  return `${kept} upgrades still come from the pond; ${other} upgrades are placed in the seed.`;
};

const pondStatusOf = (selection: CapacityPondSelection): readonly string[] => [
  sellingSentence(selection.pond, selection.capacity),
  familiesSentence(selection),
];

export { pondStatusOf };
