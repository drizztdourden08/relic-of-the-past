/* @layer shared-game @kind logic */
/**
 * The interpreter: a rule tree compiled into the closure the engine calls.
 *
 * Children are compiled once, when the parent is, so asking a rule walks closures and never the
 * tree. Every closure reads the world through the state it is asked with, which is the world the
 * rule was registered on. A compiled rule carries its own tree as `.node`, so any rule the engine
 * holds can be read back as data.
 */
import { canCollectLocation } from './collect';
import { readRuleOption } from './rule-options';
import { readSeedValue } from './seed-value-read';
import { helperDefinition } from './helpers-registry';
import type { CollectionState, Holding } from '../collection-state';
import type { Rule } from '../world.type';
import type { OptionRef, RuleArg, RuleCount, RuleNode, SeedRef } from './rule-node.type';

type Check = (state: CollectionState) => boolean;

/** Pair a closure with the tree it computes. The closure must answer exactly what the tree says. */
const ruleOf = (node: RuleNode, check: Check): Rule => Object.assign(check, { node });

/** A setting reading or a seed-table value, read off the world the rule is asked in. */
const refOf = (state: CollectionState, ref: OptionRef | SeedRef): number | string | boolean =>
  ('seed' in ref ? readSeedValue(state.world, ref.seed) : readRuleOption(state.world, ref.option));

const countOf = (state: CollectionState, count: RuleCount): number =>
  (typeof count === 'number' ? count : Number(refOf(state, count)));

const argOf = (state: CollectionState, arg: RuleArg): number | string | boolean =>
  (typeof arg === 'object' ? refOf(state, arg) : arg);

const compileHelper = (node: Extract<RuleNode, { op: 'helper' }>): Check => {
  const { body } = helperDefinition(node.name);
  const args = node.args ?? [];
  if (args.every((arg) => typeof arg !== 'object')) {
    const fixed = args as readonly (number | string | boolean)[];
    return (state) => body(state, ...fixed);
  }
  return (state) => body(state, ...args.map((arg) => argOf(state, arg)));
};

const compileCheck = (node: RuleNode): Check => {
  switch (node.op) {
    case 'true': return () => true;
    case 'false': return () => false;
    case 'has': {
      const { item, count = 1 } = node;
      if (typeof item === 'object') return (state) => state.has(String(refOf(state, item)) as Holding, count);
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
    case 'helper': return compileHelper(node);
    default: throw new Error(`unknown rule op: ${JSON.stringify(node)}`);
  }
};

const compileRule = (node: RuleNode): Rule => ruleOf(node, compileCheck(node));

export { compileRule, ruleOf };
