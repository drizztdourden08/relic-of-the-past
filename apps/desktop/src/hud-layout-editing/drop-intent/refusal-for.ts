/* @layer renderer-components @kind logic */
import { MAX_EXPANDED_NODES, worstCaseNodeCount } from '@rotp/hud';
import { siteOf, walkNodes } from '../node-edits';
import { moveAll } from './move-all';
import type { HudContainer, HudLayout, HudNode, HudPlace } from '@rotp/hud';
import type { Refusal } from './drop-intent.type';

const subtreeIds = (doc: HudLayout, node: HudNode): Set<string> =>
  new Set(walkNodes({ ...doc, screen: node as HudContainer }).map((site) => site.node.id));

const isEmbedHost = (node: HudNode): boolean =>
  node.kind === 'element' && (node.element.type === 'repeat' || node.element.type === 'switch');

const refusalFor = (
  doc: HudLayout, ids: readonly string[], parentId: string, place?: HudPlace,
): { reason: Refusal; nodeId: string | null } | null => {
  const target = siteOf(doc, parentId);
  for (const id of ids) {
    const site = siteOf(doc, id);
    if (!site?.parent) return { reason: 'source-locked', nodeId: id };
    if (id === parentId) return { reason: 'self', nodeId: id };
    if (site.node.kind === 'container' && subtreeIds(doc, site.node).has(parentId)) {
      return { reason: 'descendant', nodeId: parentId };
    }
  }
  if (!target) return { reason: 'not-a-container', nodeId: parentId };
  if (isEmbedHost(target.node)) return { reason: 'target-locked', nodeId: parentId };
  if (target.node.kind !== 'container') return { reason: 'not-a-container', nodeId: parentId };
  if (place?.column !== undefined && target.node.layout === 'grid' && place.column > target.node.columns.length) {
    return { reason: 'grid-column', nodeId: parentId };
  }
  const prospective = moveAll(doc, ids, parentId, target.node.children.length);
  if (worstCaseNodeCount(prospective.screen) > MAX_EXPANDED_NODES) return { reason: 'budget', nodeId: parentId };
  return null;
};

export { refusalFor };
