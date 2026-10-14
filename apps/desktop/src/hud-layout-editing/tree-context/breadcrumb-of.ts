/* @layer renderer-components @kind logic */
import { labelOf } from '../new-node';
import { embeddedOf } from '../node-edits';
import { childrenOf } from './children-of';
import { rootsOf } from './roots-of';
import type { HudLayout, HudNode } from '@rotp/hud';

const crumbsTo = (node: HudNode, id: string): string[] | null => {
  if (node.id === id) return [labelOf(node)];
  for (const child of [...childrenOf(node), ...embeddedOf(node)]) {
    const below = crumbsTo(child, id);
    if (below) return [labelOf(node), ...below];
  }
  return null;
};

const breadcrumbOf = (doc: HudLayout, id: string): string[] => {
  for (const root of rootsOf(doc)) {
    const crumbs = crumbsTo(root, id);
    if (crumbs) return crumbs;
  }
  return [];
};

export { breadcrumbOf };
