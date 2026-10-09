/* @layer shared-game @kind constants */
import { ITEM } from '../../item-ids.data';
import { allOf, hasItem } from '../../rules/combinators';
import {
  canLiftHeavyRocks, canUseMedallion, hasBeamSword, hasMireMedallion, hasTurtleRockMedallion,
} from '../../rules/helper-rules';
import { bombShopRule, towerRule } from '../../rules/story-gate-rules';
import { BOMBS_HELD_CHECK } from '../bombs-record.constants';
import { WORLD_EVENT_IDS } from '../story-events.data';
import type { ActToken, EventGate } from '../event-gate.type';

const EVENT_GATES: readonly EventGate[] = [
  { checkId: 'check-353', precondition: hasItem(ITEM.bookOfMudora) },
  { checkId: 'check-325', precondition: hasItem(ITEM.pegasusBoots) },
  { checkId: 'check-342', precondition: bombShopRule },
  { checkId: 'check-327', precondition: allOf(canLiftHeavyRocks, hasItem(ITEM.hammer)) },
  { checkId: 'check-334', precondition: hasItem(ITEM.hammer) },
  { checkId: 'check-344', precondition: allOf(canUseMedallion, hasMireMedallion) },
  { checkId: 'check-345', precondition: allOf(canUseMedallion, hasTurtleRockMedallion) },
  { checkId: 'check-343', precondition: hasItem(ITEM.fireRod) },
  { checkId: 'check-314', precondition: hasBeamSword },
  { checkId: 'check-348', precondition: towerRule },
  { checkId: 'check-332' },
  { checkId: 'check-333' },
  { checkId: BOMBS_HELD_CHECK },
];

const GATE_BY_CHECK: ReadonlyMap<string, EventGate> = new Map(EVENT_GATES.map((gate) => [gate.checkId, gate]));

const RECORDED_ACTS: readonly ActToken[] = [...EVENT_GATES.map((gate) => gate.checkId), ...WORLD_EVENT_IDS];

export { EVENT_GATES, GATE_BY_CHECK, RECORDED_ACTS };
