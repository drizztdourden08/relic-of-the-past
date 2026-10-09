/* @layer renderer-components @kind logic */
import { embeddedOf } from '../node-edits';
import { childrenOf } from './children-of';
import { rootsOf } from './roots-of';
import type { HudContainer, HudLayout, HudNode } from '@shared/types/hud';

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

export { realParentOf };
