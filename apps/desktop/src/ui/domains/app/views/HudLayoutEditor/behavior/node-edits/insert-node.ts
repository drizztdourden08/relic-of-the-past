/* @layer renderer-components @kind logic */
import { mapTree } from './map-tree';
import type { HudLayout, HudNode } from '@rotp/hud';

const insertNode = (doc: HudLayout, parentId: string, node: HudNode, at?: number): HudLayout =>
  mapTree(doc, (current) => {
    if (current.id !== parentId || current.kind !== 'container') return current;
    const children = [...current.children];
    children.splice(at ?? children.length, 0, node);
    return { ...current, children };
  });

export { insertNode };
