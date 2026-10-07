/* @layer shared-hud @kind logic */
/**
 * The dynamic tree, turned into a static one - ONCE per frame, before
 * measurement (phase 3 of `plans/hud-data-binding.html`). `repeat` unrolls
 * into its own resolved count of sibling copies of its child; `switch`
 * resolves to whichever one case (or `otherwise`) wins. What comes out the
 * other end is ordinary containers and elements - `measure.ts` / `place.ts`
 * never see either dynamic kind, and neither has to know they ever existed.
 *
 * WHY A REPEAT VANISHES INSTEAD OF WRAPPING ITS UNROLLED CHILDREN. The
 * plan's own worked example wraps a `repeat` directly in a flex row with
 * `wrap: true` and expects the ROW's own wrap/gap to apply across the
 * individual copies - not across one box holding all of them. So a
 * container's `children` array gets the repeat's N expanded instances
 * spliced in at the repeat's own position, never a second container around
 * them.
 *
 * IDS STAY UNIQUE BY CONSTRUCTION. A `switch` keeps the winning branch's own
 * id - the switch's id never survives expansion, the same way its box
 * properties do not (see below). A `repeat` instance then suffixes
 * `#<index>` onto whatever id its (already-expanded) child produced, which is
 * unique across every unrolled copy regardless of which switch case, if any,
 * won inside it.
 *
 * A DYNAMIC NODE'S OWN BOX PROPERTIES DO NOT SURVIVE IT. Neither `repeat` nor
 * `switch` ever draws its own box - a repeat becomes N of its child's boxes,
 * a switch becomes exactly one branch's - so any `scale`/`margin`/`style`/etc.
 * authored directly on the dynamic node itself is not meaningful and is
 * dropped instead of silently misapplied to something it never described.
 *
 * A REPEAT INSTANCE'S OWN VALUES ARE BAKED, NOT LEFT AS EXPRESSIONS. `index`,
 * `count` and `item` exist ONLY in the per-pass scope built here - the
 * document's global data scope (`MeasureContext.scope`, one flat table for
 * the whole tree) has never heard of them. So every bound field under a
 * repeat's child (`bake-values.ts`'s `bakeNode`) is resolved to a literal
 * NUMBER the moment its instance is built, using that exact per-pass scope -
 * identical to what `measure.ts`/`place.ts` would have computed a moment
 * later anyway, since nothing about the data scope changes between one
 * expansion and the measurement that immediately follows it in the same
 * frame. Nothing outside a repeat is touched: those fields already read the
 * one global scope measure/place already use, so baking them early would
 * change nothing and cost real work for no reason.
 *
 * THE GUARD IS A HARD BUDGET, NOT A PROMISE. `ceil(1 / 0)` must not become a
 * repeat of a million hearts: one repeat's resolved count is clamped to
 * `MAX_REPEAT_COUNT`, and a running total across the WHOLE expansion stops
 * producing anything more the moment it would exceed `MAX_EXPANDED_NODES` -
 * belt and braces beside `validate-expand-budget.ts`'s static, load-time
 * refusal of a document whose worst case is already too large.
 */

import { bakeNode } from './bake-values';
import { MAX_EXPANDED_NODES, MAX_REPEAT_COUNT } from '../data/expand-limits';
import { resolveValue } from '../data/resolve-value';
import type { HudContainer, HudNode } from '../../types/hud/hud-node';
import type { Value } from '../../types/hud/hud-value';
import type { MeasureContext } from './engine.type';

type Scope = Readonly<Record<string, number>>;

interface Budget { remaining: number }

/** One id, suffixed for one repeat pass - applied to a whole expanded
 *  subtree's ROOT only; a container's own descendants keep their own ids,
 *  which are already unique within the authored document and do not repeat
 *  inside a single repeat pass (only the repeated subtree itself does). */
const withIndex = (node: HudNode, index: number): HudNode => ({ ...node, id: `${node.id}#${index}` });

const truthy = (expr: string, scope: Scope): boolean => resolveValue({ from: 'data', expr }, scope) !== 0;

/** A repeat's own resolved count: floored, never negative, capped at
 *  `MAX_REPEAT_COUNT` - the one caller that knows "this is a COUNT" and
 *  applies that floor itself (`resolve-value.ts`'s own note on why it does
 *  not guess this for every caller). */
const repeatCount = (count: Value, scope: Scope): number => (
  Math.max(0, Math.min(MAX_REPEAT_COUNT, Math.floor(resolveValue(count, scope))))
);

/**
 * @param insideRepeat true once we are anywhere under a `repeat`'s `child` -
 *                      the flag `bakeNode` is gated on, so ordinary documents
 *                      with no `repeat` in them never pay for it.
 */
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

/**
 * A CONTAINER EXPANDS TO EXACTLY ONE CONTAINER, which is why this takes one
 * instead of a `HudNode`: the container branch above always answers a
 * one-element array, so there is no "several instances came out of the root"
 * case left to invent a wrapper for. The screen is a container by
 * construction (`validate-layout.ts`), and it is the only root there is.
 *
 * @param root the document's screen, exactly as authored/validated
 * @param ctx  the same context the rest of the engine measures and places
 *             against - its `scope` is where `repeat`/`switch` expressions
 *             read the live data table from.
 */
const expand = (root: HudContainer, ctx: MeasureContext = {}): HudContainer => {
  const budget: Budget = { remaining: MAX_EXPANDED_NODES };
  const [result] = expandNode(root, ctx, ctx.scope ?? {}, budget, false);
  return (result as HudContainer | undefined) ?? root;
};

export { expand };
