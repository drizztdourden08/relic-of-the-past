/* @layer shared-game @kind logic */
import { canCollectLocation } from '../collect';
import { readRuleOption } from '../rule-options';
import { readSeedValue } from '../seed-value-read';
import { ruleArgOf } from './rule-arg-of';
import { compileHelperCall } from './compile-helper-call';
import type { CollectionState, Holding } from '../../collection-state.type';
import type { RuleCount, RuleNode } from '../rule-node.type';
import type { RuleCheck } from '../rules.type';

const countOf = (state: CollectionState, count: RuleCount): number =>
  (typeof count === 'number' ? count : Number(ruleArgOf(state, count)));

const compileCheck = (node: RuleNode): RuleCheck => {
  switch (node.op) {
    case 'true': return () => true;
    case 'false': return () => false;
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
    case 'all': {
      const children = node.of.map(compileCheck);
      return (state) => children.every((child) => child(state));
    }
    case 'any': {
      const children = node.of.map(compileCheck);
      return (state) => children.some((child) => child(state));
    }
    case 'if': {
      const [cond, whenTrue, whenFalse] = [node.cond, node.then, node.else].map(compileCheck);
      return (state) => (cond(state) ? whenTrue(state) : whenFalse(state));
    }
    case 'region': {
      const { region } = node;
      return (state) => state.canReachRegion(region);
    }
    case 'location': {
      const { location } = node;
      return (state) => canCollectLocation(state, location);
    }
    case 'exit': {
      const { name } = node;
      return (state) => {
        const rule = state.world.getRule(name);
        return rule === undefined || rule(state);
      };
    }
    case 'placedAt': {
      const { location, item } = node;
      return (state) => state.world.placedItems.get(location) === item;
    }
    case 'option': {
      const { key, equals } = node;
      return (state) => readRuleOption(state.world, key) === equals;
    }
    case 'seed': {
      const { key, equals } = node;
      return (state) => readSeedValue(state.world, key) === equals;
    }
    case 'helper': return compileHelperCall(node);
    default: throw new Error(`unknown rule op: ${JSON.stringify(node)}`);
  }
};

export { compileCheck };
