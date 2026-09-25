/* @layer renderer-components @kind logic */
/**
 * WHAT A DROP WOULD DO. Never how the pointer said it.
 *
 * Two producers want to move a node: the outline, which speaks in rows and
 * zones, and the keyboard, which speaks in directions. They cannot share a
 * `DropTarget` because a direction has no `before`, but they can, and must, share
 * what comes AFTER it. Both produce a `DropIntent`; exactly one function
 * consumes it.
 *
 * A THIRD PRODUCER LIVED HERE AND DOES NOT ANY MORE. §44 made the stage a drop
 * surface and gave it `stageIntent`; §46 removed that mechanic entirely, so the
 * `grid` variant of a `DropIntent` no longer has a producer. What is left is `applyDrop`,
 * which still writes it, and the cell-highlight work that is coming to the
 * Layout section. It stays because the vocabulary is what the two halves agree
 * on, and dropping it would have to be reinvented to say the same thing.
 *
 * ONE WRITE, AND THIS IS THE ONLY FILE THAT MAKES IT. `moveNode` moves the tree
 * and `patchNode` writes the cell; a grid drop is two edits to one document and
 * has to be one entry. The same rule `behavior/offset.ts` proved for
 * `margin.left`: a second writer is drift, and a test greps for one.
 *
 * VALIDITY IS CHECKED AFTER THE TARGET IS CHOSEN, AND NEVER RETARGETS. Silently
 * walking outward to the nearest legal ancestor is the obvious alternative and
 * it is wrong: a drag that always finds SOMEWHERE to drop teaches nothing,
 * while a drag that refuses over the exact box you cannot use teaches the rule
 * in one attempt. So every refusal names both nodes and the caller shows it.
 *
 * `ids` IS AN ARRAY FROM DAY ONE and takes exactly one entry. Multi-select is
 * deliberately not built, but this signature is the only place that decision
 * would be expensive to reverse. The rule, written down now: a multi-drop
 * preserves DOCUMENT order among the dragged nodes, not selection order,
 * inserted contiguously at the resolved index.
 *
 * THE OUTLINE CAN NOW INSERT AT THE FRONT OF A CONTAINER. `resolveDrop`, which
 * this replaces, answered `{ parentId, at: children.length }` for every
 * `inside`, so the outline could only ever APPEND, and the front of a
 * collapsed container, or of the screen itself, was unreachable by any gesture.
 * That last one matters under §42: the screen's own children order IS the paint
 * order, so "put this backdrop behind everything" is a front insertion and had
 * no control at all. The middle band splits at the row's own midline, which is
 * the same above/below reading the `before`/`after` bands already use one level
 * out.
 */
import { MAX_EXPANDED_NODES, worstCaseNodeCount } from '@shared/hud/layouts';
import { moveNode, patchNode, siteOf, walkNodes } from './node-edits';
import type { HudContainer, HudLayout, HudNode, HudPlace } from '@shared/types/hud';

type Refusal =
  | 'self' // the node, or a container into itself
  | 'descendant' // the target is inside the dragged subtree
  | 'not-a-container' // a leaf cannot hold children
  | 'source-locked' // screen root / repeat child / switch case
  | 'target-locked' // onto a repeat or switch element itself
  | 'grid-column' // past the last DECLARED column (rows grow, columns do not)
  | 'budget'; // worstCaseNodeCount would pass MAX_EXPANDED_NODES

type DropIntent =
  | { kind: 'flex'; parentId: string; index: number }
  | { kind: 'grid'; parentId: string; place: HudPlace; onto: string | null }
  | { kind: 'refused'; reason: Refusal; parentId: string | null; nodeId: string | null };

/** The four zones of one outline row. `inside-start` and `inside-end` are the
 *  two halves of what used to be one `inside`, split at the row's midline. */
type DropZone = 'before' | 'inside-start' | 'inside-end' | 'after';

/** Where in the row the pointer is, 0 at the top edge and 1 at the bottom.
 *  A LEAF has no `inside` to lose the middle to, so its middle collapses to
 *  `after` exactly as it always has. The screen is the row with NO SIBLINGS. It has
 *  no `before`/`after` either, so the whole row is its interior. */
const zoneIn = (at: number, opts: { isContainer: boolean; hasSiblings: boolean }): DropZone => {
  const { isContainer, hasSiblings } = opts;
  if (!isContainer) return hasSiblings && at < 0.25 ? 'before' : 'after';
  if (hasSiblings && at < 0.25) return 'before';
  if (hasSiblings && at > 0.75) return 'after';
  return at < 0.5 ? 'inside-start' : 'inside-end';
};

const refused = (reason: Refusal, parentId: string | null, nodeId: string | null = null): DropIntent =>
  ({ kind: 'refused', reason, parentId, nodeId });

/** Every id inside one node's own subtree, including itself. It is the same walk
 *  `moveNode` uses to refuse a container into its own descendant. */
const subtreeIds = (doc: HudLayout, node: HudNode): Set<string> =>
  new Set(walkNodes({ ...doc, screen: node as HudContainer }).map((site) => site.node.id));

/** A repeat's or a switch's element node: an ordinary child of an ordinary
 *  container as a SOURCE, but never a destination, because its one child is set in
 *  Content, not by a drag. */
const isEmbedHost = (node: HudNode): boolean =>
  node.kind === 'element' && (node.element.type === 'repeat' || node.element.type === 'switch');

/** The document order of the dragged set. A multi-drop lands in this order,
 *  never in the order they were selected in. */
const inDocumentOrder = (doc: HudLayout, ids: readonly string[]): string[] => {
  const wanted = new Set(ids);
  return walkNodes(doc).filter((site) => wanted.has(site.node.id)).map((site) => site.node.id);
};

/** The tree half of a drop, shared by `applyDrop` and by the budget check's own
 *  prospective document. The budget must be measured on what the drop WOULD
 *  produce, and a refusal discovered on release is a refusal the ghost lied
 *  about. */
const moveAll = (doc: HudLayout, ids: readonly string[], parentId: string, index: number): HudLayout =>
  inDocumentOrder(doc, ids).reduce((next, id, i) => moveNode(next, id, parentId, index + i), doc);

/**
 * Why this drop cannot happen, or `null`. Runs on the container the pointer
 * already chose; it never picks a different one.
 */
const refusalFor = (
  doc: HudLayout, ids: readonly string[], parentId: string, place?: HudPlace,
): { reason: Refusal; nodeId: string | null } | null => {
  const target = siteOf(doc, parentId);
  for (const id of ids) {
    const site = siteOf(doc, id);
    // The screen, a repeat's child and a switch's case all read `parent: null`:
    // there is no array to splice them out of.
    if (!site || !site.parent) return { reason: 'source-locked', nodeId: id };
    if (id === parentId) return { reason: 'self', nodeId: id };
    if (site.node.kind === 'container' && subtreeIds(doc, site.node).has(parentId)) {
      return { reason: 'descendant', nodeId: parentId };
    }
  }
  if (!target) return { reason: 'not-a-container', nodeId: parentId };
  if (isEmbedHost(target.node)) return { reason: 'target-locked', nodeId: parentId };
  if (target.node.kind !== 'container') return { reason: 'not-a-container', nodeId: parentId };
  if (place?.column !== undefined && target.node.layout === 'grid' && place.column > target.node.columns.length) {
    return { reason: 'grid-column', nodeId: parentId };
  }
  // Cheap enough per frame: a pure recursion over a few hundred authored nodes.
  const prospective = moveAll(doc, ids, parentId, target.node.children.length);
  if (worstCaseNodeCount(prospective.screen) > MAX_EXPANDED_NODES) return { reason: 'budget', nodeId: parentId };
  return null;
};

/**
 * The OUTLINE's producer. `before`/`after` become a flex index in the row's own
 * parent; the two `inside` halves become the front and the back of the row
 * itself.
 */
const outlineIntent = (doc: HudLayout, rowId: string, zone: DropZone, ids: readonly string[]): DropIntent => {
  const site = siteOf(doc, rowId);
  if (!site) return refused('not-a-container', null, rowId);
  const inside = zone === 'inside-start' || zone === 'inside-end';
  const parentId = inside ? rowId : site.parent?.id ?? null;
  if (!parentId) return refused(inside ? 'not-a-container' : 'source-locked', null, rowId);
  const stop = refusalFor(doc, ids, parentId);
  if (stop) return refused(stop.reason, parentId, stop.nodeId);
  const container = siteOf(doc, parentId)?.node as HudContainer;
  if (inside) return { kind: 'flex', parentId, index: zone === 'inside-start' ? 0 : container.children.length };
  return { kind: 'flex', parentId, index: site.index + (zone === 'after' ? 1 : 0) };
};

/**
 * THE ONE WRITE. A `flex` intent is one `moveNode`; a `grid` intent is a
 * `moveNode` and a `patchNode`, applied together so the pair is one edit.
 *
 * A `place` that has stopped meaning anything is DELETED on the way, by the same
 * rule and for the same reason as `offset.ts`'s "zero is absent". A node that only
 * changed position inside its OWN parent keeps its cell, because there the key
 * still means what it said.
 */
const applyDrop = (doc: HudLayout, ids: readonly string[], intent: DropIntent): HudLayout => {
  if (intent.kind === 'refused') return doc;
  const ordered = inDocumentOrder(doc, ids);
  const reparented = ordered.filter((id) => siteOf(doc, id)?.parent?.id !== intent.parentId);
  if (intent.kind === 'flex') {
    const moved = moveAll(doc, ordered, intent.parentId, intent.index);
    // Entering a container without a resolved cell writes no `place` at all:
    // auto-flow in document order, which is what an outline drop means.
    return reparented.reduce((next, id) => patchNode(next, id, { place: undefined }), moved);
  }
  const target = siteOf(doc, intent.parentId)?.node;
  const at = target?.kind === 'container' ? target.children.length : 0;
  const moved = moveAll(doc, ordered, intent.parentId, at);
  return ordered.reduce((next, id) => patchNode(next, id, { place: intent.place }), moved);
};

/** The refusal, as a sentence that names BOTH nodes, because "invalid target" is not
 *  something anyone can act on. These are the ghost's line 2 and, flattened,
 *  the outline's `aria-live` announcement.
 *
 *  It names nodes by ID instead of by `labelOf`, which answers the node's KIND
 *  ("row", "grid") and would produce "row is already inside row". The id is
 *  what the outline shows beside that kind, and it is the half that identifies. */
const refusalText = (doc: HudLayout, ids: readonly string[], intent: DropIntent): string | null => {
  if (intent.kind !== 'refused') return null;
  const name = (id: string | null): string => (id && siteOf(doc, id) ? id : 'that');
  const dragged = name(ids[0] ?? null);
  const other = name(intent.nodeId);
  switch (intent.reason) {
    case 'self': return `can't drop ${dragged} into itself`;
    case 'descendant': return `${other} is already inside ${dragged}`;
    case 'not-a-container': return `${other} can't hold anything`;
    case 'source-locked': return `${dragged} is set in Content, not by dragging`;
    case 'target-locked': return `a repeat's child is set in Content`;
    case 'grid-column': return `${other} has no such column`;
    default: return `would expand past the ${MAX_EXPANDED_NODES}-node cap`;
  }
};

export { applyDrop, outlineIntent, refusalFor, refusalText, zoneIn };
export type { DropIntent, DropZone, Refusal };
