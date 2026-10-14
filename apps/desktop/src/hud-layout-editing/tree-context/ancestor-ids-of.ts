/* @layer renderer-components @kind logic */
import { embeddedOf } from '../node-edits';
import { childrenOf } from './children-of';
import type { HudLayout, HudNode } from '@rotp/hud';

const pathTo = (node: HudNode, id: string): string[] | null => {
  if (node.id === id) return [];
  for (const child of [...childrenOf(node), ...embeddedOf(node)]) {
    const below = pathTo(child, id);
    if (below) return [node.id, ...below];
  }
  return null;
};

const ancestorIdsOf = (doc: HudLayout, id: string): string[] => pathTo(doc.screen, id) ?? [];

export { ancestorIdsOf };
