/* @layer renderer-hooks @kind logic */
/**
 * The capacity/pond rule, applied to the creation form's whole choices object.
 * Two readings, both pure:
 *
 *   withCapacityPondRule: an edit has just landed, so the side the player
 *                          moved keeps its value and the other is re-pointed.
 *                          A family a sibling setting pinned (retro bow and
 *                          the projectiles) keeps its STORED setting in the
 *                          choices: the rule masks it on the way to the
 *                          snapshot, and switching retro off hands it back.
 *   capacityPondStateOf: what the panel renders, with the notes binding on the
 *                          current pair, whether each tab is editable, and the
 *                          pond modes its dropdown may offer. The choices are
 *                          already reconciled by the time they are stored, so
 *                          this never changes a value.
 */
import { reconcileCapacityPond } from '@shared/randomizer/ap-world/capacity-pond';
import { capacityPondOf } from './randomizer-choices';
import type { CapacityProfile } from '@shared/randomizer/ap-world/capacity';
import type {
  CapacityPondAuthority, ReconciledCapacityPond,
} from '@shared/randomizer/ap-world/capacity-pond';
import type { RandomizerOptionChoices } from './randomizer-choices';

/** The settled profile, with every pinned family's stored setting put back. */
const keepingPinned = (settled: ReconciledCapacityPond, stored: CapacityProfile): CapacityProfile => {
  if (settled.forcedFamilies.size === 0) return settled.capacity;
  const kept = Object.fromEntries([...settled.forcedFamilies.keys()].map((family) => [family, stored[family]]));
  return { ...settled.capacity, ...kept } as CapacityProfile;
};

/** The choices with the rule settled around the control that was just moved. */
const withCapacityPondRule = (
  choices: RandomizerOptionChoices, authority: CapacityPondAuthority,
): RandomizerOptionChoices => {
  const settled = reconcileCapacityPond(capacityPondOf(choices), authority);
  return { ...choices, capacityEnabled: settled.enabled, capacity: keepingPinned(settled, choices.capacity), pond: settled.pond };
};

/** Everything the two tabs need to render the rule honestly. */
const capacityPondStateOf = (choices: RandomizerOptionChoices): ReconciledCapacityPond =>
  reconcileCapacityPond(capacityPondOf(choices));

export { capacityPondStateOf, withCapacityPondRule };
