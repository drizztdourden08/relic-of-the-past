/* @layer shared-game @kind logic */
import { all, any, has, option } from '../rule-node-build';
import { GATE_MEDALLIONS } from './derived-nodes.constants';
import type { RuleNode, RuleOptionKey } from '../rule-node.type';

const medallionHeldNode = (key: RuleOptionKey): RuleNode =>
  any(...GATE_MEDALLIONS.map((medallion) => all(option(key, medallion), has(medallion))));

export { medallionHeldNode };
