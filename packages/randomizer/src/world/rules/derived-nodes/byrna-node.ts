/* @layer shared-game @kind logic */
import { ITEM } from '../../item-ids';
import { BYRNA_ENEMY_LIMIT } from '../../state-helpers-world';
import { all, has, helper } from '../rule-node-build';
import type { RuleNode } from '../rule-node.type';

const byrnaNode = (enemies: number): RuleNode =>
  (enemies < BYRNA_ENEMY_LIMIT ? has(ITEM.caneOfByrna) : all(has(ITEM.caneOfByrna), helper('canExtendMagic')));

export { byrnaNode };
