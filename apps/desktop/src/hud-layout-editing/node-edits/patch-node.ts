/* @layer renderer-components @kind logic */
import { isHudNode } from './is-hud-node';
import { mapTree } from './map-tree';
import type { HudLayout, HudNode } from '@rotp/hud';

const patchNode = (doc: HudLayout, id: string, patch: Partial<HudNode>): HudLayout =>
  mapTree(doc, (node) => {
    if (node.id !== id) return node;
    const merged: Record<string, unknown> = { ...node, ...patch };
    for (const key of Object.keys(patch)) {
      if (Reflect.get(patch, key) === undefined) Reflect.deleteProperty(merged, key);
    }
    return isHudNode(merged) ? merged : node;
  });

export { patchNode };
