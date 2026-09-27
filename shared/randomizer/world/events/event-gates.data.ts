/* @layer shared-game @kind data */
/**
 * Every act the rules ask about, and the dataset event check that certifies it.
 *
 * Two kinds of row sit here. The first eight are the generator's own event items, whose
 * locations the fill sweeps; listing them says which dataset check proves each one, so a
 * tracker reading the record does not have to guess, and the item the fill places there is
 * what the collected state calls the act. The rest are the acts that used to be written as
 * item rules, where holding the item stood in for having done the thing. Those carry no item,
 * so the check that certifies them IS what the state calls them and nothing is named twice. A
 * row with no precondition is one the rules cannot judge at all, so only the record can answer
 * for it.
 *
 * A rule asks for an act BY CHECK ID (`actGate('check-314')`), so the record is the only name
 * an act has.
 */
import { ITEM } from '../item-ids.data';
import { allOf, hasItem } from '../rules/combinators';
import { canLiftHeavyRocks, hasBeamSword } from '../state-helpers';
import { canUseMedallion, hasMireMedallion, hasTurtleRockMedallion } from '../state-helpers-world';
import { bombShopRule, towerRule } from '../rules/story-gate-rules';
import { BOMBS_HELD_CHECK } from './bombs-record';
import type { EventGate } from './event-gate.type';

const EVENT_GATES: readonly EventGate[] = [
  // The eight event items the generator already carried. Their locations keep their own rules,
  // so no precondition is repeated here; the row exists to name the check that proves the act.
  { checkId: 'check-351', token: ITEM.triforce },            // Ganon beaten
  { checkId: 'check-329', token: ITEM.beatAgahnim1 },        // Agahnim 1 beaten
  { checkId: 'check-349', token: ITEM.beatAgahnim2 },        // Agahnim 2 beaten
  { checkId: 'check-326', token: ITEM.openFloodgate },       // Floodgate lever pulled
  { checkId: 'check-335', token: ITEM.getFrog },
  { checkId: 'check-336', token: ITEM.returnSmith },
  { checkId: 'check-337', token: ITEM.pickUpPurpleChest },
  { checkId: 'check-324', token: ITEM.activatedFlute },      // Weathervane opened

  // Acts that used to be item rules. The precondition is the rule that was there, so a world
  // with no record to read answers exactly as it did before.
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
