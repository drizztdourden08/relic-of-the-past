/* @layer shared-game @kind logic */
import { ITEM } from '../../item-ids.data';
import { any, has, hasAny, helper } from '../rule-node-build';
import { byrnaNode } from './byrna-node';
import type { RuleNode } from '../rule-node.type';

const killStandardStartNode = (enemies: number): RuleNode => any(
  helper('hasMeleeWeapon'),
  has(ITEM.caneOfSomaria),
  byrnaNode(enemies),
  hasAny([ITEM.bow, ITEM.progressiveBow]),
  has(ITEM.fireRod),
  helper('canUseBombs', enemies),
);

export { killStandardStartNode };
