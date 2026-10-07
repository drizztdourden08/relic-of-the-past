/* @layer renderer-components @kind logic */
/**
 * Editing a TREE, as pure functions over a whole document.
 *
 * Every operation takes a layout and returns a new one; nothing is mutated and
 * nothing here knows about React. That is what lets the draft be a memento (one
 * value to compare against, one value to reset to) and what lets these be
 * reasoned about on their own. The outline's drag, the toolbar's insert and
 * the inspector's edit are all the same three functions.
 *
 * ONE TREE, ONE ROOT. The nine anchored regions are gone (§42): every former
 * region is an ordinary child of the screen, so the "a region root has no
 * parent, and may never gain one" asymmetry went with them. The screen is the
 * only node `parentOf` answers null for, and the only one `moveNode` refuses.
 * Everything else can be dragged into anything, which is what the outline
 * already looked like it promised.
 *
 * A MOVE IS A REMOVE FOLLOWED BY AN INSERT, and the index is resolved against
 * the list AFTER the removal. Doing it the other way round drops a node one
 * place short of where it was aimed whenever it moves down among its own
 * siblings, which reads as the drag having missed.
 *
 * A `repeat`'s `child` AND A `switch`'s CASE/`otherwise` NODES ARE REACHABLE
 * TOO (phase 7 of `plans/hud-data-binding.html`, which closed the gap §25.8 named: "no
 * dedicated UI yet to edit... a switch's cases... short of hand-editing").
 * They have no array to splice. `parent` reads `null` for them, exactly like
 * a region root, so they can be selected and patched (a heart's own sprite
 * file, tuned from the inspector) but never moved or dropped into by the
 * outline's drag, which stays scoped to real container children unchanged.
 * Removing one removes the CASE it belongs to (when + node together, since a
 * case with no face means nothing); removing a repeat's only child is refused
 * because a repeat cannot exist without one. Both work by `mapTree` folding the
 * removal back to the original instead of producing an invalid document.
 */
import type {
  HudContainer, HudElementSpec, HudLayout, HudNode, HudSwitchCase,
} from '@shared/types/hud';

/** One node, and where it sits. `parent` is null for the screen, AND for a
 *  repeat's `child` or a switch's case/`otherwise` node. See the header. */
interface NodeSite {
  node: HudNode;
  parent: HudContainer | null;
  index: number;
}

const childrenOf = (node: HudNode): readonly HudNode[] =>
  node.kind === 'container' ? node.children : [];

/** The nodes embedded directly in an element spec (a repeat's `child`, a
 *  switch's cases and `otherwise`). None of them live in a container's own
 *  `children` array. */
const embeddedOf = (node: HudNode): readonly HudNode[] => {
  if (node.kind !== 'element') return [];
  const { element } = node;
  if (element.type === 'repeat') return [element.child];
  if (element.type === 'switch') return [...element.cases.map((c) => c.node), ...(element.otherwise ? [element.otherwise] : [])];
  return [];
};

/** Depth-first walk, parents before children, which is the document's own order. */
const walkNodes = (doc: HudLayout): NodeSite[] => {
  const out: NodeSite[] = [];
  const visit = (node: HudNode, parent: HudContainer | null, index: number): void => {
    out.push({ node, parent, index });
    childrenOf(node).forEach((child, at) => visit(child, node as HudContainer, at));
    embeddedOf(node).forEach((child, at) => visit(child, null, at));
  };
  // THE SCREEN IS THE FIRST ROW, always, and the only row with no parent -
  // nothing reorders or reparents it.
  visit(doc.screen, null, 0);
  return out;
};

const siteOf = (doc: HudLayout, id: string): NodeSite | null =>
  walkNodes(doc).find((site) => site.node.id === id) ?? null;

const nodeById = (doc: HudLayout, id: string): HudNode | null => siteOf(doc, id)?.node ?? null;

/** Rebuilds a `repeat`/`switch` spec through `visit`, folding an impossible
 *  removal back to the spec's own original instead of producing a document
 *  with no child, or a case with no node. */
const visitElementSpec = (spec: HudElementSpec, visit: (node: HudNode) => HudNode | null): HudElementSpec => {
  if (spec.type === 'repeat') {
    const child = visit(spec.child);
    return child ? { ...spec, child } : spec;
  }
  if (spec.type === 'switch') {
    const cases = spec.cases
      .map((c): HudSwitchCase | null => { const node = visit(c.node); return node ? { ...c, node } : null; })
      .filter((c): c is HudSwitchCase => c !== null);
    const otherwise = spec.otherwise ? (visit(spec.otherwise) ?? undefined) : undefined;
    // Never down to zero cases. A switch with nothing to match is not a
    // document this removal should be able to produce; fall back to the
    // original list instead of silently emptying it.
    return { ...spec, cases: cases.length > 0 ? cases : spec.cases, otherwise };
  }
  return spec;
};

/** Rebuild every node in the document through `map`, children first. That covers real
 *  container children AND any repeat/switch-embedded node alike. */
const mapTree = (doc: HudLayout, map: (node: HudNode) => HudNode | null): HudLayout => {
  const visit = (node: HudNode): HudNode | null => {
    const mapped = map(node);
    if (!mapped) return null;
    if (mapped.kind === 'container') {
      const children = mapped.children.map(visit).filter((child): child is HudNode => child !== null);
      return { ...mapped, children };
    }
    return { ...mapped, element: visitElementSpec(mapped.element, visit) };
  };
  // THE SCREEN CANNOT BE DELETED. A map that answers null for it - or answers
  // something that is not a container - keeps the original, because a document
  // that lost its root would have nothing at all to draw.
  const screen = visit(doc.screen);
  return { ...doc, screen: screen && screen.kind === 'container' ? screen : doc.screen };
};

/** Shallow-merge a patch onto one node. The caller owns the patch's shape; a
 *  key set to `undefined` is dropped, which is how a box property is cleared. */
const patchNode = (doc: HudLayout, id: string, patch: Partial<HudNode>): HudLayout =>
  mapTree(doc, (node) => {
    if (node.id !== id) return node;
    const merged = { ...node, ...patch } as Record<string, unknown>;
    for (const key of Object.keys(patch)) {
      if ((patch as Record<string, unknown>)[key] === undefined) delete merged[key];
    }
    return merged as unknown as HudNode;
  });

/** Drop one node, and everything under it. */
const removeNode = (doc: HudLayout, id: string): HudLayout =>
  mapTree(doc, (node) => (node.id === id ? null : node));

/** Put `node` into `parentId`'s children, at `at` (default: last). */
const insertNode = (doc: HudLayout, parentId: string, node: HudNode, at?: number): HudLayout =>
  mapTree(doc, (current) => {
    if (current.id !== parentId || current.kind !== 'container') return current;
    const children = [...current.children];
    children.splice(at ?? children.length, 0, node);
    return { ...current, children };
  });

/**
 * Move `id` into `parentId` at `at`.
 *
 * A refused move returns the document untouched. It is refused when the node is
 * the screen, when the target is not a container, or when the target is the node
 * itself or anything inside it, which would detach the subtree from the document.
 */
const moveNode = (doc: HudLayout, id: string, parentId: string, at: number): HudLayout => {
  const site = siteOf(doc, id);
  if (!site || !site.parent) return doc;
  if (id === parentId) return doc;
  const inside = walkNodes({ ...doc, screen: site.node as HudContainer });
  if (site.node.kind === 'container' && inside.some((entry) => entry.node.id === parentId)) return doc;
  const target = nodeById(doc, parentId);
  if (!target || target.kind !== 'container') return doc;
  return insertNode(removeNode(doc, id), parentId, site.node, at);
};

export {
  embeddedOf, insertNode, mapTree, moveNode, nodeById, patchNode, removeNode, siteOf, walkNodes,
};
export type { NodeSite };
