/* @layer shared-game @kind data */
/**
 * The locations the transformed state can still pick up, from Archipelago
 * worlds/alttp/Rules.py set_bunny_rules 1668-1673. Check ids. Two of them are story
 * events of the world (the chest found, the smiths reunited), which the source keeps as
 * event locations, so the same exemption covers them.
 *
 * The regions that list named (1663-1666, and the one shop handled apart at 1769-1771) are
 * gone from here: being impassable while transformed is a fact about the place, so it is a
 * `bunnyImpassable` flag on the region record and `bunny.ts` reads it off the collection.
 */
import type { CheckId } from '@shared/game/data/types/ids';

const BUNNY_ACCESSIBLE_LOCATIONS: ReadonlySet<CheckId> = new Set<CheckId>([
  'check-017',   // the mentor's, at the start
  'check-033',   // the elder's gift
  'check-041',   // the bedridden child's
  'check-043',   // the hidden clearing
  'check-044',   // the felled tree
  'check-047',   // the tiled cave
  'check-056',   // the cauldron room's own chest
  'check-061',   // the cave under the lookout
  'check-076',   // the standing item on the pyramid
  'check-088',   // the generous one, deep in the cave
  'check-271',   // the cave under the pegs
  'check-272',   // the ledge past the bumper cave
  'check-337',   // the ruined smiths' chest, found
  'check-071',   // the standing item on the lookout
  'check-080',   // the southern tablet
  'check-070',   // the northern tablet
  'check-010',   // the purple chest, delivered
  'check-039',   // the smith's reward
  'check-336',   // the smiths, reunited
  'check-072',   // the pedestal
  'check-007',   // the bottle seller
  'check-009',   // the item under the water
  'check-059',   // the desert ledge
]);

export { BUNNY_ACCESSIBLE_LOCATIONS };
