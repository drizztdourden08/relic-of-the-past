/* @layer shared-game @kind constants */
import { ITEM } from '../item-ids.data';
import {
  canActivateCrystalSwitch, canGetGoodBee, canKillMostThings, canKillStandardStart,
} from '../state-helpers-world';
import { any, hasAny, helper } from './rule-node-build';
import { DEFAULT_ENEMY_COUNT } from './derived-nodes/derived-nodes.constants';
import { goodBeeNode } from './derived-nodes/good-bee-node';
import { killMostNode } from './derived-nodes/kill-most-node';
import { killStandardStartNode } from './derived-nodes/kill-standard-start-node';
import type { HelperDefinition } from './helper-definition.type';

const COMBAT_HELPERS: readonly HelperDefinition[] = [
  {
    name: 'canActivateCrystalSwitch', params: [], body: (state) => canActivateCrystalSwitch(state),
    expand: () => any(
      helper('hasMeleeWeapon'),
      helper('canUseBombs'),
      helper('canShootArrows'),
      hasAny([
        ITEM.hookshot, ITEM.caneOfSomaria, ITEM.caneOfByrna, ITEM.fireRod, ITEM.iceRod,
        ITEM.blueBoomerang, ITEM.redBoomerang,
      ]),
    ),
  },
  {
    name: 'canKillMostThings', params: ['enemies'],
    body: (state, ...args) => canKillMostThings(state, ...(args as [number?])),
    expand: (_world, enemies = DEFAULT_ENEMY_COUNT) => killMostNode(Number(enemies)),
  },
  {
    name: 'canKillStandardStart', params: ['enemies'],
    body: (state, ...args) => canKillStandardStart(state, ...(args as [number?])),
    expand: (_world, enemies = DEFAULT_ENEMY_COUNT) => killStandardStartNode(Number(enemies)),
  },
  {
    name: 'canGetGoodBee', params: [], body: (state) => canGetGoodBee(state),
    expand: (world) => goodBeeNode(world),
  },
];

export { COMBAT_HELPERS };
