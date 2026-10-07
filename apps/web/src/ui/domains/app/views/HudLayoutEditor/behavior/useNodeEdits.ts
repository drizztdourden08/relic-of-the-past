/* @layer renderer-components @kind hook */
/**
 * Selection, and the four things that can be done to the selected node.
 *
 * The selection is an ID, not a node, on purpose: every edit rebuilds
 * the tree, so a held node object would be a stale copy of itself one keystroke
 * later. An id survives every rebuild and resolves against the current draft.
 *
 * INSERT GOES INTO THE SELECTED CONTAINER. When an ELEMENT is selected the
 * insert lands beside it, in its parent, immediately after it, which is what
 * "add another one of these here" means to someone pointing at a chip. With
 * nothing selected it falls back to the screen itself, so the toolbar is never
 * inert.
 *
 * The newly inserted node becomes the selection, because the next thing anyone
 * does after inserting is size or move the thing they just made.
 */
import { useCallback, useState } from 'react';
import { insertNode, patchNode, removeNode, siteOf } from './node-edits';
import { applyDrop } from './drop-intent';
import type { DropIntent } from './drop-intent';
import type { HudLayout, HudNode } from '@shared/types/hud';

interface NodeEdits {
  selectedId: string | null;
  select: (id: string | null) => void;
  /** Where an insert would land right now. The toolbar shows it. */
  targetId: (doc: HudLayout | null) => string | null;
  insert: (node: HudNode) => void;
  remove: (id: string) => void;
  /** ONE drag, ONE edit. Both surfaces resolve to a `DropIntent` and this is
   *  the only door it comes through. `behavior/drop-intent.ts` is the only
   *  module in the editor that calls `moveNode`, and a test says so. */
  drop: (ids: readonly string[], intent: DropIntent) => void;
  patch: (id: string, patch: Partial<HudNode>) => void;
}

/** The container an insert belongs in, and the index inside it. */
const insertSite = (doc: HudLayout, selectedId: string | null): { parentId: string; at?: number } => {
  const fallback = { parentId: doc.screen.id };
  if (!selectedId) return fallback;
  const site = siteOf(doc, selectedId);
  if (!site) return fallback;
  if (site.node.kind === 'container') return { parentId: site.node.id };
  return site.parent ? { parentId: site.parent.id, at: site.index + 1 } : fallback;
};

const useNodeEdits = (apply: (change: (doc: HudLayout) => HudLayout) => void): NodeEdits => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const targetId = useCallback(
    (doc: HudLayout | null) => (doc ? insertSite(doc, selectedId).parentId || null : null),
    [selectedId],
  );

  const insert = useCallback((node: HudNode) => {
    apply((doc) => {
      const { parentId, at } = insertSite(doc, selectedId);
      return parentId ? insertNode(doc, parentId, node, at) : doc;
    });
    setSelectedId(node.id);
  }, [apply, selectedId]);

  const remove = useCallback((id: string) => {
    apply((doc) => removeNode(doc, id));
    setSelectedId((current) => (current === id ? null : current));
  }, [apply]);

  const drop = useCallback((ids: readonly string[], intent: DropIntent) => {
    apply((doc) => applyDrop(doc, ids, intent));
  }, [apply]);

  const patch = useCallback((id: string, next: Partial<HudNode>) => {
    apply((doc) => patchNode(doc, id, next));
  }, [apply]);

  return { selectedId, select: setSelectedId, targetId, insert, remove, drop, patch };
};

export { insertSite, useNodeEdits };
export type { NodeEdits };
