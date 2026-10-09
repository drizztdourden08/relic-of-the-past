/* @layer shared-game @kind logic */
import { expansionOf } from './expansion-of';
import { RULE_FALSE, RULE_TRUE } from './specialize-node.constants';
import type { World } from '../../world/world.type';
import type { Holding } from '../../world/collection-state';
import type { RuleArg, RuleCount, RuleNode } from '../../world/rules/rule-node.type';
import type { Readings } from './export.type';

const valueOf = (readings: Readings, ref: RuleArg): string | number | boolean => {
  if (typeof ref !== 'object') return ref;
  return 'seed' in ref ? readings.seed(ref.seed) : readings.option(ref.option);
};

const countOf = (readings: Readings, count: RuleCount): number => Number(valueOf(readings, count));

const join = (op: 'all' | 'any', parts: readonly RuleNode[]): RuleNode => {
  const absorbing = op === 'all' ? 'false' : 'true';
  if (parts.some((part) => part.op === absorbing)) return op === 'all' ? RULE_FALSE : RULE_TRUE;
  const kept = parts.filter((part) => part.op !== (op === 'all' ? 'true' : 'false'));
  if (kept.length === 0) return op === 'all' ? RULE_TRUE : RULE_FALSE;
  return kept.length === 1 ? kept[0] : { op, of: kept };
};

const specializeNode = (node: RuleNode, world: World, readings: Readings): RuleNode => {
  const again = (child: RuleNode): RuleNode => specializeNode(child, world, readings);
  switch (node.op) {
    case 'all':
    case 'any': return join(node.op, node.of.map(again));
    case 'if': {
      const cond = again(node.cond);
      if (cond.op === 'true') return again(node.then);
      if (cond.op === 'false') return again(node.else);
      return { op: 'if', cond, then: again(node.then), else: again(node.else) };
    }
    case 'option': return readings.option(node.key) === node.equals ? RULE_TRUE : RULE_FALSE;
    case 'seed': return readings.seed(node.key) === node.equals ? RULE_TRUE : RULE_FALSE;
    case 'has': return typeof node.item === 'object'
      ? { ...node, item: String(valueOf(readings, node.item)) as Holding }
      : node;
    case 'hasDistinct':
    case 'countGroup': return { ...node, atLeast: countOf(readings, node.atLeast) };
    case 'helper': {
      const args = (node.args ?? []).map((arg) => valueOf(readings, arg));
      const plain = { ...node, args };
      const expansion = expansionOf(plain, world);
      return expansion === undefined ? plain : again(expansion);
    }
    default: return node;
  }
};

export { specializeNode };
