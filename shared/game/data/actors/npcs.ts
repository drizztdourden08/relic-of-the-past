/* @layer shared-game @kind data */
/** Split out of the flat seed files by scripts/generate-ids/split-seeds.ts. */
import type { ActorRecord } from '../types';

const NPC_ACTORS: ActorRecord[] = [
  {
    id: 'actor-001',
    gameId: { spriteType: 22 },
    kind: 'npc',
    randomizerName: 'Sahasrahla',
  },
  {
    id: 'actor-002',
    gameId: { spriteType: 26 },
    kind: 'npc',
    randomizerName: 'Blacksmith',
  },
  {
    id: 'actor-003',
    gameId: { spriteType: 26 },
    kind: 'npc',
    randomizerName: 'Frog',
  },
  {
    id: 'actor-004',
    gameId: { spriteType: 26 },
    kind: 'npc',
    randomizerName: 'Missing Smith',
  },
  {
    id: 'actor-005',
    gameId: { spriteType: 31 },
    kind: 'npc',
    randomizerName: 'Sick Kid',
  },
  {
    id: 'actor-006',
    gameId: { spriteType: 43 },
    kind: 'npc',
    randomizerName: 'Hobo',
  },
  {
    id: 'actor-007',
    gameId: { spriteType: 46 },
    kind: 'npc',
    randomizerName: 'Stumpy',
  },
  {
    id: 'actor-008',
    gameId: { spriteType: 57 },
    kind: 'npc',
    randomizerName: 'Purple Chest',
  },
  {
    id: 'actor-009',
    gameId: { spriteType: 58 },
    kind: 'npc',
    randomizerName: 'Magic Bat',
  },
  {
    id: 'actor-010',
    gameId: { spriteType: 82 },
    kind: 'npc',
    randomizerName: 'King Zora',
  },
  {
    id: 'actor-011',
    gameId: { spriteType: 115 },
    kind: 'npc',
    randomizerName: 'Uncle',
    combat: {
      health: 0,
      flags4: 10,
      damageByClass: {
        '0': 0,
        '1': 0,
        '2': 0,
        '3': 0,
        '4': 0,
        '5': 0,
        '6': 0,
        '7': 0,
        '8': 0,
        '9': 0,
        '10': 0,
        '11': 0,
        '12': 0,
        '13': 0,
        '14': 0,
        '15': 0,
      },
    },
  },
  {
    id: 'actor-012',
    gameId: { spriteType: 117 },
    kind: 'npc',
    randomizerName: 'Bottle Merchant',
  },
  {
    id: 'actor-013',
    gameId: { spriteType: 173 },
    kind: 'npc',
    randomizerName: 'Old Man',
  },
  {
    id: 'actor-014',
    gameId: { spriteType: 192 },
    kind: 'npc',
    randomizerName: 'Catfish',
  },
];

export { NPC_ACTORS };
