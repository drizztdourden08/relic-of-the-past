/* @layer renderer-components @kind hook */
import { useCallback, useState } from 'react';
import { insertNode, patchNode, removeNode } from './node-edits';
import { applyDrop } from './drop-intent';
import { insertSite } from './insert-site';
import type { DropIntent } from './drop-intent';
import type { HudLayout, HudNode } from '@rotp/hud';
import type { NodeEdits } from './node-edits.type';

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

export { useNodeEdits };
