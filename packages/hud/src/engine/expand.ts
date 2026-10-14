/* @layer shared-hud @kind logic */
import { bakeNode } from './bake-values';
import { MAX_EXPANDED_NODES, MAX_REPEAT_COUNT } from '../data/expand-limits.constants';
import { resolveValue } from '../data/resolve-value';
import type { HudContainer, HudNode, HudRepeatSpec, HudSwitchSpec } from '../types/hud-node';
import type { Value } from '../types/hud-value';
import type { MeasureContext, Scope } from './engine.type';
import type { Budget, ExpandState } from './expand.type';

const withIndex = (node: HudNode, index: number): HudNode => ({ ...node, id: `${node.id}#${index}` });

const truthy = (expr: string, scope: Scope): boolean => resolveValue({ from: 'data', expr }, scope) !== 0;

const repeatCount = (count: Value, scope: Scope): number => (
  Math.max(0, Math.min(MAX_REPEAT_COUNT, Math.floor(resolveValue(count, scope))))
);

const expandContainer = (node: HudContainer, state: ExpandState): HudNode[] => {
  const { scope, budget, insideRepeat } = state;
  budget.remaining -= 1;
  const children = node.children.flatMap((child) => expandNode(child, state));
  const container = { ...node, children };
  return [insideRepeat ? (bakeNode(container, scope)) : container];
};

const expandRepeat = (spec: HudRepeatSpec, state: ExpandState): HudNode[] => {
  const { scope, budget } = state;
  const count = repeatCount(spec.count, scope);
  const itemExpr = spec.item ?? 'index';
  const out: HudNode[] = [];
  for (let index = 0; index < count; index += 1) {
    if (budget.remaining <= 0) break;
    const passScope: Scope = { ...scope, index, count };
    const item = resolveValue({ from: 'data', expr: itemExpr }, passScope);
    const expanded = expandNode(spec.child, { scope: { ...passScope, item }, budget, insideRepeat: true });
    expanded.forEach((child) => out.push(withIndex(child, index)));
  }
  return out;
};

const expandSwitch = (spec: HudSwitchSpec, state: ExpandState): HudNode[] => {
  const winner = spec.cases.find((c) => truthy(c.when, state.scope))?.node ?? spec.otherwise;
  return winner ? expandNode(winner, state) : [];
};

const expandNode = (node: HudNode, state: ExpandState): HudNode[] => {
  const { scope, budget, insideRepeat } = state;
  if (budget.remaining <= 0) return [];
  if (node.kind === 'container') return expandContainer(node, state);
  const { element } = node;
  if (element.type === 'repeat') return expandRepeat(element, state);
  if (element.type === 'switch') return expandSwitch(element, state);
  budget.remaining -= 1;
  return [insideRepeat ? bakeNode(node, scope) : node];
};

const expand = (root: HudContainer, ctx: MeasureContext = {}): HudContainer => {
  const budget: Budget = { remaining: MAX_EXPANDED_NODES };
  const [result] = expandNode(root, { scope: ctx.scope ?? {}, budget, insideRepeat: false });
  return (result as HudContainer | undefined) ?? root;
};

export { expand };
