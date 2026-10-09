/* @layer shared-game @kind constants */
import { BOTTLE_ITEMS } from '../item-groups';
import { any, has } from './rule-node-build';
import type { RuleNode } from './rule-node.type';

const HAS_ANY_BOTTLE: RuleNode = any(...BOTTLE_ITEMS.map((bottle) => has(bottle)));

export { HAS_ANY_BOTTLE };
