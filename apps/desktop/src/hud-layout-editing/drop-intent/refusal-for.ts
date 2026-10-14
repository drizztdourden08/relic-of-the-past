/* @layer renderer-components @kind logic */
import { MAX_EXPANDED_NODES, worstCaseNodeCount } from '@rotp/hud';
import { siteOf, walkNodes } from '../node-edits';
import { moveAll } from './move-all';
import type { HudContainer, HudLayout, HudNode, HudPlace } from '@rotp/hud';
import type { Stop } from './drop-intent.type';

const subtreeIds = (doc: HudLayout, node: HudNode): Set<string> =>
  new Set(walkNodes({ ...doc, screen: node as HudContainer }).map((site) => site.node.id));

const isEmbedHost = (node: HudNode): boolean =>
  node.kind === 'element' && (node.element.type === 'repeat' || node.element.type === 'switch');

const sourceStop = (doc: HudLayout, id: string, parentId: string): Stop | null => {
  const site = siteOf(doc, id);
  if (!site?.parent) return { reason: 'source-locked', nodeId: id };
  if (id === parentId) return { reason: 'self', nodeId: id };
  if (site.node.kind === 'container' && subtreeIds(doc, site.node).has(parentId)) {
    return { reason: 'descendant', nodeId: parentId };
  }
  return null;
};

const hasNoSuchColumn = (target: HudContainer, place?: HudPlace): boolean =>
  place?.column !== undefined && target.layout === 'grid' && place.column > target.columns.length;

const targetStop = (
  doc: HudLayout, ids: readonly string[], parentId: string, place?: HudPlace,
): Stop | null => {
  const target = siteOf(doc, parentId);
  if (!target) return { reason: 'not-a-container', nodeId: parentId };
  if (isEmbedHost(target.node)) return { reason: 'target-locked', nodeId: parentId };
  if (target.node.kind !== 'container') return { reason: 'not-a-container', nodeId: parentId };
  if (hasNoSuchColumn(target.node, place)) return { reason: 'grid-column', nodeId: parentId };
  const prospective = moveAll(doc, ids, parentId, target.node.children.length);
  if (worstCaseNodeCount(prospective.screen) > MAX_EXPANDED_NODES) return { reason: 'budget', nodeId: parentId };
  return null;
};

const refusalFor = (
  doc: HudLayout, ids: readonly string[], parentId: string, place?: HudPlace,
): Stop | null => {
  for (const id of ids) {
    const stop = sourceStop(doc, id, parentId);
    if (stop) return stop;
  }
  return targetStop(doc, ids, parentId, place);
};

export { refusalFor };
