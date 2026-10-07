/* @layer shared-game @kind data */
/**
 * Every act the rules judge from an inventory, and the dataset event check that certifies it.
 *
 * These are the acts that used to be written as item rules, where holding the item stood in for
 * having done the thing. The check that certifies one IS what the state calls it, so nothing is
 * named twice. A row with no precondition is one the rules cannot judge at all, so only the
 * record can answer for it.
 *
 * The story events that happen at a place (a boss beaten, the smiths reunited) are not here:
 * the solver finds those in the world by reaching them (story-events.data.ts).
 *
 * A rule asks for an act BY CHECK ID (`actGate('check-314')`), so the record is the only name
 * an act has.
 */
import { ITEM } from '../item-ids.data';
import { allOf, hasItem } from '../rules/combinators';
import {
  canLiftHeavyRocks, canUseMedallion, hasBeamSword, hasMireMedallion, hasTurtleRockMedallion,
} from '../rules/helper-rules';
import { bombShopRule, towerRule } from '../rules/story-gate-rules';
import { BOMBS_HELD_CHECK } from './bombs-record';
import type { EventGate } from './event-gate.type';

const EVENT_GATES: readonly EventGate[] = [
  // The precondition is the item rule that was there, so a world with no record to read
  // answers exactly as it did before.
  { checkId: 'check-353', precondition: hasItem(ITEM.bookOfMudora) },   // the desert statues, moved
  { checkId: 'check-325', precondition: hasItem(ITEM.pegasusBoots) },   // the tomb, cracked open
  { checkId: 'check-342', precondition: bombShopRule },                 // the pyramid wall, blown up
  { checkId: 'check-327', precondition: allOf(canLiftHeavyRocks, hasItem(ITEM.hammer)) },   // the warp pegs
  { checkId: 'check-334', precondition: hasItem(ITEM.hammer) },         // the peg field, flattened
  { checkId: 'check-344', precondition: allOf(canUseMedallion, hasMireMedallion) },
  { checkId: 'check-345', precondition: allOf(canUseMedallion, hasTurtleRockMedallion) },
  { checkId: 'check-343', precondition: hasItem(ITEM.fireRod) },        // the back thorns, burned
  { checkId: 'check-314', precondition: hasBeamSword },                 // the barrier, cut down
  { checkId: 'check-348', precondition: towerRule },                    // the tower, opened

  // The two the rules cannot judge. One is hired for rupees the generator does not count, the
  // other is a door pulled open with the gloves, and the event's own record carries that.
  { checkId: 'check-332' },
  { checkId: 'check-333' },

  // Not a place changed, a thing owned: the ledger remembers that a bomb was once held, which
  // is the only source for it, because the carry limit says nothing (events/bombs-record.ts).
  { checkId: BOMBS_HELD_CHECK },
];

export { EVENT_GATES };
