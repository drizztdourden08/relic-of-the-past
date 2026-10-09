/* @layer shared-hud @kind logic */
import { bakeNode } from './bake-values';
import { MAX_EXPANDED_NODES, MAX_REPEAT_COUNT } from '../data/expand-limits.constants';
import { resolveValue } from '../data/resolve-value';
import type { HudContainer, HudNode } from '../../types/hud/hud-node';
import type { Value } from '../../types/hud/hud-value';
import type { MeasureContext, Scope } from './engine.type';
import type { Budget } from './expand.type';

const withIndex = (node: HudNode, index: number): HudNode => ({ ...node, id: `${node.id}#${index}` });

const truthy = (expr: string, scope: Scope): boolean => resolveValue({ from: 'data', expr }, scope) !== 0;

const repeatCount = (count: Value, scope: Scope): number => (
  Math.max(0, Math.min(MAX_REPEAT_COUNT, Math.floor(resolveValue(count, scope))))
);

const expandNode = (
  node: HudNode, ctx: MeasureContext, scope: Scope, budget: Budget, insideRepeat: boolean,
): HudNode[] => {
  if (budget.remaining <= 0) return [];

  if (node.kind === 'container') {
    budget.remaining -= 1;
    const children = node.children.flatMap((child) => expandNode(child, ctx, scope, budget, insideRepeat));
    const container = { ...node, children };
    return [insideRepeat ? (bakeNode(container, scope) as typeof container) : container];
  }

  const { element } = node;

  if (element.type === 'repeat') {
    const count = repeatCount(element.count, scope);
    const itemExpr = element.item ?? 'index';
    const out: HudNode[] = [];
    for (let index = 0; index < count; index += 1) {
      if (budget.remaining <= 0) break;
      const passScope: Scope = { ...scope, index, count };
      const item = resolveValue({ from: 'data', expr: itemExpr }, passScope);
      const expanded = expandNode(element.child, ctx, { ...passScope, item }, budget, true);
      expanded.forEach((child) => out.push(withIndex(child, index)));
    }
    return out;
  }

  if (element.type === 'switch') {
    const winner = element.cases.find((c) => truthy(c.when, scope))?.node ?? element.otherwise;
    return winner ? expandNode(winner, ctx, scope, budget, insideRepeat) : [];
  }

  budget.remaining -= 1;
  return [insideRepeat ? bakeNode(node, scope) : node];
};

const expand = (root: HudContainer, ctx: MeasureContext = {}): HudContainer => {
  const budget: Budget = { remaining: MAX_EXPANDED_NODES };
  const [result] = expandNode(root, ctx, ctx.scope ?? {}, budget, false);
  return (result as HudContainer | undefined) ?? root;
};

export { expand };
