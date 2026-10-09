/* @layer renderer-components @kind logic */
import { insertNode } from './insert-node';
import { nodeById } from './node-by-id';
import { removeNode } from './remove-node';
import { siteOf } from './site-of';
import { walkNodes } from './walk-nodes';
import type { HudContainer, HudLayout } from '@shared/types/hud';

const moveNode = (doc: HudLayout, id: string, parentId: string, at: number): HudLayout => {
  const site = siteOf(doc, id);
  if (!site || !site.parent) return doc;
  if (id === parentId) return doc;
  const inside = walkNodes({ ...doc, screen: site.node as HudContainer });
  if (site.node.kind === 'container' && inside.some((entry) => entry.node.id === parentId)) return doc;
  const target = nodeById(doc, parentId);
  if (!target || target.kind !== 'container') return doc;
  return insertNode(removeNode(doc, id), parentId, site.node, at);
};

export { moveNode };
