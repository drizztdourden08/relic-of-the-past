/* @layer shared-game @kind data */
/**
 * Goal wiring for the boss-defeat baseline, from Archipelago worlds/alttp/
 * Rules.py: the final fight's rule (611 GanonDefeatRule, 95-97 the second
 * tower fight, 616-617 the seven-crystal requirement), the drop into the
 * fight (618), the pyramid opening (734, where open_pyramid resolves 'goal' →
 * closed for this goal, leaving only the second tower fight), and the
 * bomb-delivery fairy (1354 + 1397-1401: the delivery shop sits at its
 * vanilla entrance, one of the southern second-world doors).
 */
import { ITEM } from '../../item-ids.data';
import { REGION } from '../../region-ids.data';
import {
  allOf, anyOf, canReach, hasItem,
} from '../combinators';
import { canLiftRocks, hasBeamSword } from '../../state-helpers';
import { hasCrystals } from '../../state-helpers-world';
import { ganonRule, pyramidHoleRule } from '../story-gate-rules';
import { actGate } from '../../events';
import { ganonDefeat, lastFightTakesHammer } from './bosses.data';
import type { CollectionState } from '../../collection-state';
import type { RuleEntry } from '../rule-entry.type';

/** Rules.py 1357-1358. */
const crossPegBridge = allOf(hasItem(ITEM.hammer), hasItem(ITEM.moonPearl));
/** Rules.py 1362-1363. */
const southernTeleporter = allOf(canLiftRocks, crossPegBridge);
/** Rules.py 1367-1368. */
const basicRoutes = anyOf(southernTeleporter, hasItem(ITEM.beatAgahnim1));

const COMPLETION_RULES: readonly RuleEntry[] = [
  // 611, then 97 (goal ganon) and 617 (crystals_needed_for_ganon = 7) add on.
  { kind: 'location', target: 'check-351', mode: 'set', rule: ganonDefeat },
  { kind: 'location', target: 'check-351', mode: 'add', rule: hasItem(ITEM.beatAgahnim2) },
  { kind: 'location', target: 'check-351', mode: 'add', rule: ganonRule },
  // 618: the drop asks for a blow the last fight will feel, so the hammer stands in for the
  // beam blade on the same switch the fight itself reads.
  { kind: 'exit', target: 'Ganon Drop', mode: 'set', rule: anyOf(hasBeamSword, lastFightTakesHammer) },
  // 734: open_pyramid 'goal' is false for the plain boss-defeat goal.
  { kind: 'exit', target: 'Pyramid Hole', mode: 'set', rule: pyramidHoleRule },
  // 1354 + 1397-1401 (southern second-world entrance branch).
  // The wall is already blown open, or the shop has put the bomb on sale to blow it.
  {
    kind: 'exit', target: 'Pyramid Fairy', mode: 'set',
    rule: allOf(
      canReach(REGION.eastDarkWorld), canReach(REGION.bigBombShop), actGate('check-342'),
    ),
  },
  {
    kind: 'exit', target: 'Pyramid Fairy', mode: 'add',
    rule: anyOf(crossPegBridge, allOf(hasItem(ITEM.magicMirror), hasItem(ITEM.beatAgahnim1))),
  },
];

export { COMPLETION_RULES };
