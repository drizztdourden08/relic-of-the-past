/* @layer renderer-components @kind logic */
/**
 * Three small questions the inspector's sections need answered about WHERE the
 * selected node sits, none of which `node-edits.ts`'s own `siteOf` answers on
 * its own now that a repeat's `child` and a switch's case/`otherwise` nodes
 * are reachable too (`node-edits.ts`'s own header):
 *
 *  - Which REAL container will this node's box actually be placed under, once
 *    a repeat/switch ancestor expands? `realParentOf` walks TRANSPARENTLY
 *    through them, exactly the reasoning `validate-motion-warnings.ts` already
 *    uses for the reflow walk. A repeat/switch draws no box of its own, so
 *    its embedded node inherits whichever real container holds the
 *    repeat/switch itself. This is what the Placement section's grid `cell`
 *    fields and the Layout section's engine both key off.
 *  - Is this node inside a `repeat`'s subtree, so `index`/`count`/`item` are
 *    valid variable names for `validateValue`'s own `ValueContext`?
 *  - What is this node's breadcrumb, root to here, for Identity?
 *  - Which ids sit between a root and this node, exclusive of both ends? That is the
 *    outline's own question when a stage click selects a row hidden under a
 *    collapsed ancestor and needs to know what to expand before it can scroll
 *    to it.
 */
import { embeddedOf } from './node-edits';
import { labelOf } from './new-node';
import type { HudContainer, HudLayout, HudNode, Value } from '@shared/types/hud';

const childrenOf = (node: HudNode): readonly HudNode[] => (node.kind === 'container' ? node.children : []);

/** The document's one tree. It was a list while `regions[]` hung beside the
 *  screen (§42 folded them in); it stays a function because every walk below
 *  reads "where does this document start" from exactly one place. */
const rootsOf = (doc: HudLayout): readonly HudNode[] => [doc.screen];

const realParentOf = (doc: HudLayout, id: string): HudContainer | null => {
  let found: HudContainer | null = null;
  let hit = false;
  const visit = (node: HudNode, parent: HudContainer | null): void => {
    if (hit) return;
    if (node.id === id) { found = parent; hit = true; return; }
    childrenOf(node).forEach((child) => visit(child, node as HudContainer));
    if (!hit) embeddedOf(node).forEach((child) => visit(child, parent));
  };
  rootsOf(doc).forEach((root) => visit(root, null));
  return found;
};

const isInsideRepeat = (doc: HudLayout, id: string): boolean => {
  let result = false;
  let hit = false;
  const visit = (node: HudNode, insideRepeat: boolean): void => {
    if (hit) return;
    if (node.id === id) { result = insideRepeat; hit = true; return; }
    if (node.kind === 'container') { node.children.forEach((child) => visit(child, insideRepeat)); return; }
    const { element } = node;
    if (element.type === 'repeat') visit(element.child, true);
    else if (element.type === 'switch') {
      element.cases.forEach((c) => visit(c.node, insideRepeat));
      if (element.otherwise) visit(element.otherwise, insideRepeat);
    }
  };
  rootsOf(doc).forEach((root) => visit(root, false));
  return result;
};

/** The nearest `repeat` ancestor's own spec, or null. A formula in a repeat's
 *  subtree produces `count` values instead of one, and this is where the
 *  editor learns how many and what each instance's `item` reads. They are the same
 *  three names `engine/expand.ts` bakes into its per-pass scope. */
const enclosingRepeatOf = (doc: HudLayout, id: string): { count: Value; item?: string } | null => {
  let found: { count: Value; item?: string } | null = null;
  let hit = false;
  const visit = (node: HudNode, repeat: { count: Value; item?: string } | null): void => {
    if (hit) return;
    if (node.id === id) { found = repeat; hit = true; return; }
    if (node.kind === 'container') { node.children.forEach((child) => visit(child, repeat)); return; }
    const { element } = node;
    if (element.type === 'repeat') visit(element.child, { count: element.count, item: element.item });
    else if (element.type === 'switch') {
      element.cases.forEach((c) => visit(c.node, repeat));
      if (element.otherwise) visit(element.otherwise, repeat);
    }
  };
  rootsOf(doc).forEach((root) => visit(root, null));
  return found;
};

/** Root-to-node labels, inclusive, for the Identity section's "where it sits". */
const breadcrumbOf = (doc: HudLayout, id: string): string[] => {
  const path: string[] = [];
  let hit = false;
  const visit = (node: HudNode): void => {
    if (hit) return;
    path.push(labelOf(node));
    if (node.id === id) { hit = true; return; }
    childrenOf(node).forEach((child) => visit(child));
    if (!hit) embeddedOf(node).forEach((child) => visit(child));
    if (!hit) path.pop();
  };
  rootsOf(doc).forEach((root) => { if (!hit) visit(root); });
  return path;
};

/** Root-to-parent ids, exclusive of `id` itself. This is the ancestor chain that must
 *  be expanded before a collapsed outline can show this row at all. It is a
 *  plain walk of the one tree now: the outline's own nesting and the document's
 *  own nesting are finally the same shape (§42). */
const ancestorIdsOf = (doc: HudLayout, id: string): string[] => {
  const path: string[] = [];
  let hit = false;
  const visit = (node: HudNode): void => {
    if (hit) return;
    if (node.id === id) { hit = true; return; }
    path.push(node.id);
    childrenOf(node).forEach((child) => visit(child));
    if (!hit) embeddedOf(node).forEach((child) => visit(child));
    if (!hit) path.pop();
  };
  visit(doc.screen);
  return path;
};

export { ancestorIdsOf, breadcrumbOf, enclosingRepeatOf, isInsideRepeat, realParentOf };
