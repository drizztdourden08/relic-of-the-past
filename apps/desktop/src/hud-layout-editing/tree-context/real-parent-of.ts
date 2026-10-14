/* @layer renderer-components @kind logic */
import { embeddedOf } from '../node-edits';
import { childrenOf } from './children-of';
import { rootsOf } from './roots-of';
import type { HudContainer, HudLayout, HudNode } from '@rotp/hud';
import type { Found } from './real-parent-of.type';

const search = (node: HudNode, id: string, parent: HudContainer | null): Found | null => {
  if (node.id === id) return { parent };
  for (const child of childrenOf(node)) {
    const hit = search(child, id, node as HudContainer);
    if (hit) return hit;
  }
  for (const child of embeddedOf(node)) {
    const hit = search(child, id, parent);
    if (hit) return hit;
  }
  return null;
};

const realParentOf = (doc: HudLayout, id: string): HudContainer | null => {
  for (const root of rootsOf(doc)) {
    const hit = search(root, id, null);
    if (hit) return hit.parent;
  }
  return null;
};

export { realParentOf };
