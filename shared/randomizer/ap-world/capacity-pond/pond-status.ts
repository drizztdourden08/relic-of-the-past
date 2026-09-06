/* @layer shared-game @kind logic */
/**
 * What the pond will actually do in play, said in plain sentences and read
 * off the live pair instead of kept as a hand-written note somewhere. Two
 * readings, because the tab has two questions:
 *
 *   1. what the pond sells or hands out, and what it costs;
 *   2. which of the two families it feeds are still set to Vanilla, and so
 *      still have the pond as their only source.
 *
 * The numbers come from the same plan the seed is built from, so a sentence
 * here can never quote a price the generator would not charge.
 */
import { pondPlanOf } from '../pond/pond-plan';
import { POND_VANILLA_PRICE } from '../pond/pond-ladder.data';
import { POND_FED_FAMILIES } from './capacity-pond-rule';
import type { CapacityProfile } from '../capacity/capacity-profile.type';
import type { PondPlan, PondSetting } from '../pond/pond-profile.type';
import type { CapacityPondSelection } from './capacity-pond-rule.type';

/** The two families the pond is the native source of, in the player's own words. */
const FED_LABEL: Readonly<Record<(typeof POND_FED_FAMILIES)[number], string>> = {
  explosives: 'Bomb',
  projectiles: 'Arrow',
};

const countOf = (count: number, unit: string): string => `${count} ${unit}${count === 1 ? '' : 's'}`;

/** "at 100 rupees each" when every throw costs the same, else the two ends of the range. */
const priceClause = (plan: PondPlan): string => {
  const prices = plan.throws.map((entry) => entry.price);
  const low = Math.min(...prices);
  const high = Math.max(...prices);
  return low === high ? `at ${countOf(low, 'rupee')} each` : `from ${low} to ${high} rupees`;
};

/** How many throws hand over a shuffled item. */
const prizeClause = (plan: PondPlan, verb: string): string => {
  const prizes = plan.locations.length;
  if (prizes === 0) return `None ${verb} a shuffled item, so the pond is not a check`;
  return `${prizes} ${verb} a shuffled item`;
};

/** The native pond: it sells levels, and a family moved off Vanilla gets a shuffled item in its slot. */
const nativeSentence = (capacity: CapacityProfile): string => {
  const base = `The pond sells capacity levels at ${countOf(POND_VANILLA_PRICE, 'rupee')} a throw`;
  const allVanilla = POND_FED_FAMILIES.every((family) => capacity[family].mode === 'vanilla');
  return allVanilla ? `${base}.` : `${base}; a family moved off Vanilla gets a shuffled item in its slot.`;
};

/** What the pond sells, what it costs, and how much of it repays the search. */
const sellingSentence = (pond: PondSetting, capacity: CapacityProfile, seed: string): string => {
  if (pond.mode === 'capacity') return nativeSentence(capacity);
  const plan = pondPlanOf(pond, seed);
  if (pond.mode === 'gamble') {
    return `${countOf(plan.throws.length, 'chance')} ${priceClause(plan)}. ${prizeClause(plan, 'win')}, `
      + `the rest refund half. ${plan.totalPrice} rupees for every chance.`;
  }
  return `${countOf(plan.throws.length, 'throw')} ${priceClause(plan)}. ${prizeClause(plan, 'hand over')}. `
    + `${plan.totalPrice} rupees to empty it.`;
};

const vanillaFedNames = (capacity: CapacityProfile): string[] =>
  POND_FED_FAMILIES.filter((family) => capacity[family].mode === 'vanilla').map((family) => FED_LABEL[family]);

/** With retro bow on the arrow family is out of the question; only the bomb family is the pond's. */
const retroFamiliesSentence = (capacity: CapacityProfile): string => {
  const lead = 'Arrow upgrades are off while retro bow is on. ';
  return capacity.explosives.mode === 'vanilla'
    ? `${lead}Bomb upgrades still come from the pond.`
    : `${lead}Bomb upgrades are placed in the seed instead.`;
};

/** Which of the two pond-fed families still has the pond as its only source. */
const familiesSentence = (selection: CapacityPondSelection): string => {
  const { enabled, capacity, retroBow } = selection;
  if (!enabled) return 'Capacity upgrades are off, so the pond sells bomb and arrow upgrades.';
  if (retroBow) return retroFamiliesSentence(capacity);
  const vanilla = vanillaFedNames(capacity);
  if (vanilla.length === POND_FED_FAMILIES.length) return 'Bomb and arrow upgrades still come from the pond.';
  if (vanilla.length === 0) return 'Bomb and arrow upgrades are placed in the seed; none come from the pond.';
  const [kept] = vanilla;
  const other = kept === FED_LABEL.explosives ? FED_LABEL.projectiles : FED_LABEL.explosives;
  return `${kept} upgrades still come from the pond; ${other} upgrades are placed in the seed.`;
};

/**
 * The pond tab's status: what the pond will do, then what the capacity
 * families make of it. Pure, so the panel re-reads it on every edit and the
 * sentences follow the settings with nothing to keep in step by hand.
 */
const pondStatusOf = (selection: CapacityPondSelection, seed = ''): readonly string[] => [
  sellingSentence(selection.pond, selection.capacity, seed),
  familiesSentence(selection),
];

export { pondStatusOf };
