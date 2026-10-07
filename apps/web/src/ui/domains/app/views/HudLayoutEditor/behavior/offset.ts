/* @layer renderer-components @kind logic */
/**
 * A NODE'S POSITION IS ITS `margin.left` / `margin.top`, and this file is the
 * only place that says so.
 *
 * The model has no `offset` property and deliberately does not grow one
 * (`plans/hud-inspector-ux-review.html`, Open questions): a child's
 * displacement already IS its margin. That is how the shipped button
 * cluster's radial item offsets are authored, and how a region root is nudged
 * away from the anchor it hangs on (`engine/anchor-rect.ts`). Adding a second
 * property would give every node two ways to be displaced and a merge rule to
 * explain.
 *
 * THERE IS ONE WRITER LEFT, AND THAT IS THE POINT OF THE FILE (§47). §37 wrote
 * it for two (the panel's `OffsetField` and the stage's margin nudge) so that
 * a position could not live in one key for the field and another for the drag.
 * §47 removed the drag (the stage selects and nothing else), so `nudged` went
 * with it and `OffsetField` is the only caller of `withOffset`. The grep that
 * forbids a hand-written `margin.left =` anywhere else under `HudLayoutEditor/`
 * stays, because it is what keeps a SECOND writer from appearing unnoticed, and
 * the Layout section's cell work is exactly the sort of thing that would.
 *
 * ZERO IS ABSENT. An offset of 0 on an axis means "wherever the parent put
 * it", which is what an unset margin already means, so committing it deletes
 * the key instead of writing a literal `0`. `EdgesInput` follows the same rule,
 * and it is why a box that was merely LOOKED at in the inspector
 * does not grow four margins.
 */
import type { Edges } from '@shared/types/hud';

interface Offset { x: number; y: number }

/** An edge set with nothing left in it is `undefined`, so a node dragged back
 *  to where it started leaves the document exactly as it was found. */
const compactEdges = (edges: Edges): Edges | undefined =>
  (Object.values(edges).some((n) => n !== undefined) ? edges : undefined);

/** What the field shows. */
const offsetOf = (margin: Edges | undefined): Offset => ({
  x: margin?.left ?? 0,
  y: margin?.top ?? 0,
});

/** The same margin with a new position in it. This is the ONE write. */
const withOffset = (margin: Edges | undefined, next: Offset): Edges | undefined => {
  const edges: Edges = { ...margin };
  if (next.x === 0) delete edges.left; else edges.left = next.x;
  if (next.y === 0) delete edges.top; else edges.top = next.y;
  return compactEdges(edges);
};

export { compactEdges, offsetOf, withOffset };
export type { Offset };
