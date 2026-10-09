/* @layer renderer-components @kind logic */
import { mapTree } from './map-tree';
import type { HudLayout, HudNode } from '@shared/types/hud';

const patchNode = (doc: HudLayout, id: string, patch: Partial<HudNode>): HudLayout =>
  mapTree(doc, (node) => {
    if (node.id !== id) return node;
    const merged = { ...node, ...patch } as Record<string, unknown>;
    for (const key of Object.keys(patch)) {
      if ((patch as Record<string, unknown>)[key] === undefined) delete merged[key];
    }
    return merged as unknown as HudNode;
  });

export { patchNode };
