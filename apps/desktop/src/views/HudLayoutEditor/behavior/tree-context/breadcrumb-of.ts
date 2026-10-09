/* @layer renderer-components @kind logic */
import { labelOf } from '../new-node';
import { embeddedOf } from '../node-edits';
import { childrenOf } from './children-of';
import { rootsOf } from './roots-of';
import type { HudLayout, HudNode } from '@rotp/hud';

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

export { breadcrumbOf };
