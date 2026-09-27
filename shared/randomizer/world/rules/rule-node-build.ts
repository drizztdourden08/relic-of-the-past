/* @layer shared-game @kind logic */
/**
 * Plain constructors for rule trees, so a tree written in code reads like the rule it is. These
 * build DATA only; rule-eval.ts turns a tree into something the engine can ask.
 */
import type { RegionId } from '@shared/game/data/types/ids';
import type { Holding } from '../collection-state';
import type {
  HelperName, RuleArg, RuleCount, RuleNode, RuleOptionKey, RuleOptionValue, SeedRef,
} from './rule-node.type';

const TRUE: RuleNode = { op: 'true' };
const FALSE: RuleNode = { op: 'false' };

const has = (item: Holding, count = 1): RuleNode =>
  (count === 1 ? { op: 'has', item } : { op: 'has', item, count });
const hasAny = (items: readonly Holding[]): RuleNode => ({ op: 'hasAny', items });
const hasDistinct = (items: readonly Holding[], atLeast: RuleCount): RuleNode =>
  ({ op: 'hasDistinct', items, atLeast });
const countGroup = (items: readonly Holding[], atLeast: RuleCount): RuleNode =>
  ({ op: 'countGroup', items, atLeast });
const all = (...of: readonly RuleNode[]): RuleNode => ({ op: 'all', of });
const any = (...of: readonly RuleNode[]): RuleNode => ({ op: 'any', of });
const when = (cond: RuleNode, then: RuleNode, otherwise: RuleNode): RuleNode =>
  ({ op: 'if', cond, then, else: otherwise });
const region = (id: RegionId): RuleNode => ({ op: 'region', region: id });
const option = (key: RuleOptionKey, equals: RuleOptionValue): RuleNode => ({ op: 'option', key, equals });
const optionRef = (key: RuleOptionKey): RuleCount & RuleArg => ({ option: key });
const seedIs = (key: string, equals: RuleOptionValue): RuleNode => ({ op: 'seed', key, equals });
const seedRef = (key: string): SeedRef => ({ seed: key });
const helper = (name: HelperName, ...args: readonly RuleArg[]): RuleNode =>
  (args.length === 0 ? { op: 'helper', name } : { op: 'helper', name, args });

/**
 * One tree per value a setting may take, tested in order, with a fallback for any other value:
 * the tree form of a `switch` over a setting.
 */
const optionSwitch = (
  key: RuleOptionKey, cases: readonly (readonly [RuleOptionValue, RuleNode])[], fallback: RuleNode,
): RuleNode => cases.reduceRight<RuleNode>(
  (otherwise, [value, then]) => when(option(key, value), then, otherwise),
  fallback,
);

export {
  FALSE, TRUE, all, any, countGroup, has, hasAny, hasDistinct, helper, option, optionRef, optionSwitch,
  region, seedIs, seedRef, when,
};
