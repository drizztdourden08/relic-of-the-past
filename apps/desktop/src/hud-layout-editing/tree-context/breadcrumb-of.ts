/* @layer renderer-components @kind logic */
import { labelOf } from '../new-node';
import type { Translate } from '../translate.type';
import { embeddedOf } from '../node-edits';
import { childrenOf } from './children-of';
import { rootsOf } from './roots-of';
import type { HudLayout, HudNode } from '@rotp/hud';

const crumbsTo = (node: HudNode, id: string, t: Translate): string[] | null => {
  if (node.id === id) return [labelOf(node, t)];
  for (const child of [...childrenOf(node), ...embeddedOf(node)]) {
    const below = crumbsTo(child, id, t);
    if (below) return [labelOf(node, t), ...below];
  }
  return null;
};

const breadcrumbOf = (doc: HudLayout, id: string, t: Translate): string[] => {
  for (const root of rootsOf(doc)) {
    const crumbs = crumbsTo(root, id, t);
    if (crumbs) return crumbs;
  }
  return [];
};

export { breadcrumbOf };
