/* @layer shared-game @kind logic */
import { ruleArgOf } from './rule-arg-of';
import type { CollectionState, Holding } from '../../collection-state.type';
import type { RuleCount } from '../rule-node.type';
import type { RuleCheck } from '../rules.type';
import type { HoldingNode } from './rule-op-groups.type';

const countOf = (state: CollectionState, count: RuleCount): number =>
  (typeof count === 'number' ? count : Number(ruleArgOf(state, count)));

const compileHolding = (node: HoldingNode): RuleCheck => {
  switch (node.op) {
    case 'has': {
      const { item, count = 1 } = node;
      if (typeof item === 'object') return (state) => state.has(String(ruleArgOf(state, item)) as Holding, count);
      return (state) => state.has(item, count);
    }
    case 'hasAny': {
      const { items } = node;
      return (state) => state.hasAny(items);
    }
    case 'hasDistinct': {
      const { items, atLeast } = node;
      return (state) => items.filter((item) => state.has(item)).length >= countOf(state, atLeast);
    }
    case 'countGroup': {
      const { items, atLeast } = node;
      return (state) => state.countGroup(items) >= countOf(state, atLeast);
    }
  }
};

export { compileHolding };
