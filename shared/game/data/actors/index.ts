/* @layer shared-game @kind data */
import type { ActorRecord } from '../types';
import { NPC_ACTORS } from './npcs';
import { OBSTACLE_ACTORS } from './obstacles';
import { TRIGGER_ACTORS_1 } from './triggers-1';
import { TRIGGER_ACTORS_2 } from './triggers-2';
import { ENEMY_ACTORS_1 } from './enemies-1';
import { ENEMY_ACTORS_2 } from './enemies-2';
import { ENEMY_ACTORS_3 } from './enemies-3';
import { ENEMY_ACTORS_4 } from './enemies-4';
import { BOSS_ACTORS } from './bosses';
import { OBJECT_ACTORS_1 } from './objects-1';
import { OBJECT_ACTORS_2 } from './objects-2';
import { OBJECT_ACTORS_3 } from './objects-3';
import { OBJECT_ACTORS_4 } from './objects-4';

const TRIGGER_ACTORS: ActorRecord[] = [...TRIGGER_ACTORS_1, ...TRIGGER_ACTORS_2];
const ENEMY_ACTORS: ActorRecord[] = [...ENEMY_ACTORS_1, ...ENEMY_ACTORS_2, ...ENEMY_ACTORS_3, ...ENEMY_ACTORS_4];
const OBJECT_ACTORS: ActorRecord[] = [...OBJECT_ACTORS_1, ...OBJECT_ACTORS_2, ...OBJECT_ACTORS_3, ...OBJECT_ACTORS_4];

const ALL_ACTORS: ActorRecord[] = [
  ...NPC_ACTORS,
  ...OBSTACLE_ACTORS,
  ...TRIGGER_ACTORS,
  ...ENEMY_ACTORS,
  ...BOSS_ACTORS,
  ...OBJECT_ACTORS,
];

export { ALL_ACTORS };
