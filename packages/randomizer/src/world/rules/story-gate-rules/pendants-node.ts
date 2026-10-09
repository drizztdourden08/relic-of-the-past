/* @layer shared-game @kind logic */
import { hasDistinct } from '../rule-node-build';
import { PENDANTS } from './story-gate-items.constants';
import type { RuleNode } from '../rule-node.type';

const pendantsNode = (count: number): RuleNode => hasDistinct(PENDANTS, count);

export { pendantsNode };
