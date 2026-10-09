/* @layer shared-game @kind data */
import type { Requirement } from '@shared/game/data/types';
import type { EventSpec } from '@shared/game/data/checks/event-spec.type';
import { canLiftRocks } from '@shared/game/data/requirements/helpers';

const BOOTS: Requirement = { itemId: 'item-026' };
const BOMBS: Requirement = { itemId: 'item-041' };

const STAIRCASE = 0x20;
const BOMBED = 0x02;

const ACT_EVENTS: EventSpec[] = [
  { n: 310, name: 'Bonk rocks smashed open', group: 'story', gameId: { owScreen: 0x13, mask: STAIRCASE }, requirements: BOOTS },
  { n: 311, name: 'Bonk Fairy uncovered (Light World)', group: 'story', gameId: { owScreen: 0x2b, mask: STAIRCASE }, requirements: BOOTS },
  { n: 312, name: 'Bonk Fairy uncovered (Dark World)', group: 'story', gameId: { owScreen: 0x6b, mask: STAIRCASE },
    requirements: { allOf: [{ itemId: 'item-032' }, BOOTS] } },
  { n: 313, name: 'Checkerboard Cave uncovered', group: 'story', gameId: { owScreen: 0x30, mask: STAIRCASE }, requirements: canLiftRocks },
  { n: 314, name: 'Hookshot Cave uncovered', group: 'story', gameId: { owScreen: 0x45, mask: STAIRCASE },
    requirements: { allOf: [{ itemId: 'item-032' }, canLiftRocks] } },
  { n: 315, name: 'Dark Lake Hylia spike cave uncovered', group: 'story', gameId: { owScreen: 0x77, mask: STAIRCASE },
    requirements: { allOf: [{ itemId: 'item-032' }, canLiftRocks] } },
  { n: 316, name: '20 Rupee Cave uncovered', group: 'story', gameId: { owScreen: 0x37, mask: STAIRCASE }, requirements: canLiftRocks },
  { n: 317, name: '50 Rupee Cave uncovered', group: 'story', gameId: { owScreen: 0x3a, mask: STAIRCASE }, requirements: canLiftRocks },
  { n: 325, name: 'Lumberjack tree fallen', group: 'story', gameId: { owScreen: 0x02, mask: STAIRCASE },
    requirements: { checkId: 'check-329' } },
  { n: 318, name: 'Bomb Hut wall blown open', group: 'story', gameId: { owScreen: 0x18, mask: BOMBED }, requirements: BOMBS },
  { n: 319, name: 'Light Hype Fairy blown open', group: 'story', gameId: { owScreen: 0x34, mask: BOMBED }, requirements: BOMBS },
  { n: 320, name: 'Mini Moldorm Cave blown open', group: 'story', gameId: { owScreen: 0x35, mask: BOMBED }, requirements: BOMBS },
  { n: 321, name: 'Ice Rod Cave blown open', group: 'story', gameId: { owScreen: 0x37, mask: BOMBED }, requirements: BOMBS },
  { n: 322, name: 'Brewery blown open', group: 'story', gameId: { owScreen: 0x58, mask: BOMBED },
    requirements: { allOf: [{ itemId: 'item-032' }, BOMBS] } },
  { n: 323, name: 'Hype Cave blown open', group: 'story', gameId: { owScreen: 0x74, mask: BOMBED },
    requirements: { allOf: [{ itemId: 'item-032' }, BOMBS] } },
  { n: 324, name: 'Dark Lake Hylia healer fairy blown open', group: 'story', gameId: { owScreen: 0x77, mask: BOMBED },
    requirements: { allOf: [{ itemId: 'item-032' }, BOMBS] } },
];

export { ACT_EVENTS };
