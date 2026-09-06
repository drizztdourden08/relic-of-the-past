/* @layer shared-game @kind data */
/**
 * Goal wiring for the boss-defeat baseline, from tests/fixtures/ap-source/
 * Rules.py: the final fight's rule (611 GanonDefeatRule, 95-97 the second
 * tower fight, 616-617 the seven-crystal requirement), the drop into the
 * fight (618), the pyramid opening (734 — open_pyramid resolves 'goal' →
 * closed for this goal, leaving only the second tower fight), and the
 * bomb-delivery fairy (1354 + 1397-1401: the delivery shop sits at its
 * vanilla entrance, one of the southern second-world doors).
 */
import {
  allOf, anyOf, canReach, hasItem,
} from '../combinators';
import { canLiftRocks, hasBeamSword } from '../../state-helpers';
import { hasCrystals } from '../../state-helpers-world';
import { ganonDefeat, lastFightTakesHammer } from './bosses.data';
import type { CollectionState } from '../../collection-state';
import type { RuleEntry } from '../rule-entry.type';

/** Rules.py 1357-1358. */
const crossPegBridge = allOf(hasItem('Hammer'), hasItem('Moon Pearl'));
/** Rules.py 1362-1363. */
const southernTeleporter = allOf(canLiftRocks, crossPegBridge);
/** Rules.py 1367-1368. */
const basicRoutes = anyOf(southernTeleporter, hasItem('Beat Agahnim 1'));

const COMPLETION_RULES: readonly RuleEntry[] = [
  // 611, then 97 (goal ganon) and 617 (crystals_needed_for_ganon = 7) add on.
  { kind: 'location', name: 'Ganon', mode: 'set', rule: ganonDefeat },
  { kind: 'location', name: 'Ganon', mode: 'add', rule: hasItem('Beat Agahnim 2') },
  { kind: 'location', name: 'Ganon', mode: 'add', rule: (state: CollectionState) => hasCrystals(state, 7) },
  // 618 — the drop asks for a blow the last fight will feel, so the hammer stands in for the
  // beam blade on the same switch the fight itself reads.
  { kind: 'exit', name: 'Ganon Drop', mode: 'set', rule: anyOf(hasBeamSword, lastFightTakesHammer) },
  // 734 — open_pyramid 'goal' is false for the plain boss-defeat goal.
  { kind: 'exit', name: 'Pyramid Hole', mode: 'set', rule: hasItem('Beat Agahnim 2') },
  // 1354 + 1397-1401 (southern second-world entrance branch).
  {
    kind: 'exit', name: 'Pyramid Fairy', mode: 'set',
    rule: allOf(
      canReach('East Dark World'), canReach('Big Bomb Shop'),
      hasItem('Crystal 5'), hasItem('Crystal 6'),
    ),
  },
  {
    kind: 'exit', name: 'Pyramid Fairy', mode: 'add',
    rule: anyOf(crossPegBridge, allOf(hasItem('Magic Mirror'), hasItem('Beat Agahnim 1'))),
  },
];

export { COMPLETION_RULES };
