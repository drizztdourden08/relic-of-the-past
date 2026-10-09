/* @layer renderer-components @kind logic */
import { embeddedOf } from '../node-edits';
import { childrenOf } from './children-of';
import type { HudLayout, HudNode } from '@shared/types/hud';

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

export { ancestorIdsOf };
