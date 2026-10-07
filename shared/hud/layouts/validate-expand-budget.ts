/* @layer shared-hud @kind logic */
/**
 * The static worst-case node count a subtree's expansion
 * (`shared/hud/engine/expand.ts`) could ever produce, priced at the LEAST
 * favourable answer at every dynamic point: a `repeat` at its own hard cap
 * (`MAX_REPEAT_COUNT`), and a `switch` at whichever one of its cases (or
 * `otherwise`) costs the most - this file does not know which branch a save
 * will pick, so it prices every one and keeps the worst.
 *
 * This is a STATIC bound over the document AS AUTHORED - it never resolves
 * an expression and never runs against a save. `validate-layout.ts` refuses
 * a document whose total exceeds `MAX_EXPANDED_NODES` for the same reason
 * `expand.ts`'s own runtime guard exists: a document that COULD draw an
 * unbounded tree is refused before it ever reaches a player's disk, rather
 * than silently truncated live.
 */

import { MAX_EXPANDED_NODES, MAX_REPEAT_COUNT } from '../data/expand-limits';
import type { HudNode } from '../../types/hud/hud-node';
import type { Value } from '../../types/hud/hud-value';

/** A LITERAL count has one deterministic answer - no save can make it
 *  anything else - so it is priced exactly, clamped the same way
 *  `expand.ts`'s own runtime floor does. Only a data-bound EXPRESSION is
 *  priced at the pessimistic cap, since its real value depends on a save this
 *  validator never sees. */
const repeatWorstCase = (count: Value): number => (
  typeof count === 'number' ? Math.max(0, Math.min(MAX_REPEAT_COUNT, Math.floor(count))) : MAX_REPEAT_COUNT
);

const worstCaseNodeCount = (node: HudNode): number => {
  if (node.kind === 'container') {
    return 1 + node.children.reduce((sum, child) => sum + worstCaseNodeCount(child), 0);
  }
  const { element } = node;
  if (element.type === 'repeat') return repeatWorstCase(element.count) * worstCaseNodeCount(element.child);
  if (element.type === 'switch') {
    const branches = [...element.cases.map((c) => c.node), ...(element.otherwise ? [element.otherwise] : [])];
    return 1 + branches.reduce((worst, branch) => Math.max(worst, worstCaseNodeCount(branch)), 0);
  }
  return 1;
};

export { MAX_EXPANDED_NODES, worstCaseNodeCount };
