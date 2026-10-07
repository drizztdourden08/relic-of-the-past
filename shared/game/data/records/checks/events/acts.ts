/* @layer shared-game @kind data */
/**
 * The overworld acts that open a cave mouth for good. The game writes each one to the save's
 * own overworld event byte for the AREA the mouth stands on (the head of a large area, never a
 * sub-screen): bit 0x20 when a staircase is uncovered by lifting or dashing, bit 0x02 when a
 * wall is bombed. So these read a fact the game already keeps and need no ledger bit.
 *
 * Every area here is the one the ROM's secrets table names for the mouth, cross-checked against
 * the disassembly and the reference's entrance table, and fourteen of them against the saves of
 * a real run, where the bit and the cave's interior appear in the same step.
 */
import type { CheckRecord, ItemId, Requirement } from '@shared/game/data/types';
import { canLiftRocks } from '@shared/game/data/requirements/helpers';
import { eventRecord } from './event-record';

const item = (id: string): Requirement => ({ itemId: id as ItemId });
const BOOTS = item('item-026');
const BOMBS = item('item-041');
/** A dark world act needs the player in their own shape: a bunny lifts nothing and sets nothing. */
const asHuman = (req: Requirement): Requirement => ({ allOf: [item('item-032'), req] });

const STAIRCASE = 0x20;
const BOMBED = 0x02;

const ACT_EVENTS: CheckRecord[] = [
  // Staircases uncovered.
  eventRecord({ n: 310, name: 'Bonk rocks smashed open', group: 'story', gameId: { owScreen: 0x13, mask: STAIRCASE }, requirements: BOOTS }),
  eventRecord({ n: 311, name: 'Bonk Fairy uncovered (Light World)', group: 'story', gameId: { owScreen: 0x2b, mask: STAIRCASE }, requirements: BOOTS }),
  eventRecord({ n: 312, name: 'Bonk Fairy uncovered (Dark World)', group: 'story', gameId: { owScreen: 0x6b, mask: STAIRCASE }, requirements: asHuman(BOOTS) }),
  // The desert and Dark Death Mountain are large areas: the mouths sit on 0x31 and 0x46, the byte is the head's.
  eventRecord({ n: 313, name: 'Checkerboard Cave uncovered', group: 'story', gameId: { owScreen: 0x30, mask: STAIRCASE }, requirements: canLiftRocks }),
  eventRecord({ n: 314, name: 'Hookshot Cave uncovered', group: 'story', gameId: { owScreen: 0x45, mask: STAIRCASE }, requirements: asHuman(canLiftRocks) }),
  eventRecord({ n: 315, name: 'Dark Lake Hylia spike cave uncovered', group: 'story', gameId: { owScreen: 0x77, mask: STAIRCASE }, requirements: asHuman(canLiftRocks) }),
  // The two rupee caves share one interior room; which area holds which name is not settled.
  eventRecord({ n: 316, name: '20 Rupee Cave uncovered', group: 'story', gameId: { owScreen: 0x37, mask: STAIRCASE }, requirements: canLiftRocks }),
  eventRecord({ n: 317, name: '50 Rupee Cave uncovered', group: 'story', gameId: { owScreen: 0x3a, mask: STAIRCASE }, requirements: canLiftRocks }),
  // Written on the exit from the first tower fight, not by the dash: it is the trunk coming down.
  eventRecord({ n: 325, name: 'Lumberjack tree fallen', group: 'story', gameId: { owScreen: 0x02, mask: STAIRCASE },
    requirements: { checkId: 'check-329' } }),
  // Walls bombed.
  // Kakariko is a large area: the hut sits on 0x20, the byte is the head's.
  eventRecord({ n: 318, name: 'Bomb Hut wall blown open', group: 'story', gameId: { owScreen: 0x18, mask: BOMBED }, requirements: BOMBS }),
  eventRecord({ n: 319, name: 'Light Hype Fairy blown open', group: 'story', gameId: { owScreen: 0x34, mask: BOMBED }, requirements: BOMBS }),
  eventRecord({ n: 320, name: 'Mini Moldorm Cave blown open', group: 'story', gameId: { owScreen: 0x35, mask: BOMBED }, requirements: BOMBS }),
  eventRecord({ n: 321, name: 'Ice Rod Cave blown open', group: 'story', gameId: { owScreen: 0x37, mask: BOMBED }, requirements: BOMBS }),
  eventRecord({ n: 322, name: 'Brewery blown open', group: 'story', gameId: { owScreen: 0x58, mask: BOMBED }, requirements: asHuman(BOMBS) }),
  eventRecord({ n: 323, name: 'Hype Cave blown open', group: 'story', gameId: { owScreen: 0x74, mask: BOMBED }, requirements: asHuman(BOMBS) }),
  eventRecord({ n: 324, name: 'Dark Lake Hylia healer fairy blown open', group: 'story', gameId: { owScreen: 0x77, mask: BOMBED }, requirements: asHuman(BOMBS) }),
];

export { ACT_EVENTS };
