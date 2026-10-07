/* @layer shared-game @kind data */

import type { ActorRecord } from '@shared/game/data/types';

const OBSTACLES_ACTORS: ActorRecord[] = [
  {
    id: 'actor-015',
    gameId: { objectSubIndex: 29 },
    kind: 'obstacle',
    name: 'Statue (4-way)',
  },
  {
    id: 'actor-016',
    gameId: { objectSubIndex: 56 },
    kind: 'obstacle',
    name: 'Statue [L-R]',
  },
  {
    id: 'actor-017',
    gameId: { objectSubIndex: 146 },
    kind: 'obstacle',
    name: 'Blue Peg Block [U-D]',
  },
  {
    id: 'actor-018',
    gameId: { objectSubIndex: 149 },
    kind: 'obstacle',
    name: 'Fake Pot [U-D]',
  },
  {
    // In player.c:5562-5588 HandleItemTileAction_Dungeon the peg tile only responds
    // when `link_item_in_hand` carries the hammer ("only hammers on pegs").
    id: 'actor-019',
    gameId: { objectSubIndex: 150 },
    kind: 'obstacle',
    name: 'Hammer Peg Block [U-D]',
    clearedBy: { itemId: 'item-010' },
  },
  {
    id: 'actor-020',
    gameId: { objectSubIndex: 184 },
    kind: 'obstacle',
    name: 'Blue Switch Block [L-R]',
  },
  {
    // Same hammer-peg tile family as actor-019 (dungeon.c draws both via
    // RoomDraw_HammerPegSingle); player.c:5572-5574 gates the interaction on the hammer.
    id: 'actor-021',
    gameId: { objectSubIndex: 189 },
    kind: 'obstacle',
    name: 'Hammer Pegs [L-R]',
    clearedBy: { itemId: 'item-010' },
  },
  {
    id: 'actor-022',
    gameId: { objectSubIndex: 221 },
    kind: 'obstacle',
    name: 'Table / Rock [4-way]',
  },
  {
    id: 'actor-023',
    gameId: { objectSubIndex: 222 },
    kind: 'obstacle',
    name: 'Spike Block [4-way]',
  },
];

export { OBSTACLES_ACTORS };
