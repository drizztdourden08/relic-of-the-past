/* @layer shared-game @kind logic */
import { ITEM } from '../../item-ids.data';
import { BOMBS_PER_ENEMY } from '../../state-helpers-world';
import { any, has, helper } from '../rule-node-build';
import { byrnaNode } from './byrna-node';
import type { RuleNode } from '../rule-node.type';

const killMostNode = (enemies: number): RuleNode => any(
  helper('hasMeleeWeapon'),
  has(ITEM.caneOfSomaria),
  byrnaNode(enemies),
  helper('canShootArrows'),
  has(ITEM.fireRod),
  helper('canUseBombs', enemies * BOMBS_PER_ENEMY),
);

export { killMostNode };
