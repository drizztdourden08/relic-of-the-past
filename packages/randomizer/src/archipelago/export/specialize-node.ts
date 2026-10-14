/* @layer shared-game @kind logic */
import { itemAt } from '../../checked-access';
import { expansionOf } from './expansion-of';
import { PASS_THROUGH_OPS, RULE_FALSE, RULE_TRUE } from './specialize-node.constants';
import type { Again, IfNode, PassThroughNode, ReadingNode } from './specialize-node.type';
import type { World } from '../../world/world.type';
import type { Holding } from '../../world/collection-state';
import type { HelperNode, RuleArg, RuleCount, RuleNode } from '../../world/rules/rule-node.type';
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
  return kept.length === 1 ? itemAt(kept, 0) : { op, of: kept };
};

const isPassThrough = (node: RuleNode): node is PassThroughNode => PASS_THROUGH_OPS.has(node.op);

const specializeIf = (node: IfNode, again: Again): RuleNode => {
  const cond = again(node.cond);
  if (cond.op === 'true') return again(node.then);
  if (cond.op === 'false') return again(node.else);
  return { op: 'if', cond, then: again(node.then), else: again(node.else) };
};

const specializeCall = (node: HelperNode, world: World, readings: Readings, again: Again): RuleNode => {
  const args = (node.args ?? []).map((arg) => valueOf(readings, arg));
  const plain = { ...node, args };
  const expansion = expansionOf(plain, world);
  return expansion === undefined ? plain : again(expansion);
};

const specializeReading = (node: ReadingNode, readings: Readings): RuleNode => {
  switch (node.op) {
    case 'option': return readings.option(node.key) === node.equals ? RULE_TRUE : RULE_FALSE;
    case 'seed': return readings.seed(node.key) === node.equals ? RULE_TRUE : RULE_FALSE;
    case 'has': return typeof node.item === 'object'
      ? { ...node, item: String(valueOf(readings, node.item)) as Holding }
      : node;
    case 'hasDistinct':
    case 'countGroup': return { ...node, atLeast: countOf(readings, node.atLeast) };
  }
};

const specializeNode = (node: RuleNode, world: World, readings: Readings): RuleNode => {
  const again: Again = (child) => specializeNode(child, world, readings);
  if (isPassThrough(node)) return node;
  if (node.op === 'all' || node.op === 'any') return join(node.op, node.of.map(again));
  if (node.op === 'if') return specializeIf(node, again);
  if (node.op === 'helper') return specializeCall(node, world, readings, again);
  return specializeReading(node, readings);
};

export { specializeNode };
