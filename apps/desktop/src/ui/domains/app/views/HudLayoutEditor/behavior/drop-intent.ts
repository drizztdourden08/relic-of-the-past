/* @layer renderer-components @kind logic */
import { MAX_EXPANDED_NODES, worstCaseNodeCount } from '@rotp/hud';
import { moveNode, patchNode, siteOf, walkNodes } from './node-edits';
import type { HudContainer, HudLayout, HudNode, HudPlace } from '@rotp/hud';
import type { DropIntent, DropZone, Refusal } from './drop-intent.type';

const zoneIn = (at: number, opts: { isContainer: boolean; hasSiblings: boolean }): DropZone => {
  const { isContainer, hasSiblings } = opts;
  if (!isContainer) return hasSiblings && at < 0.25 ? 'before' : 'after';
  if (hasSiblings && at < 0.25) return 'before';
  if (hasSiblings && at > 0.75) return 'after';
  return at < 0.5 ? 'inside-start' : 'inside-end';
};

const refused = (reason: Refusal, parentId: string | null, nodeId: string | null = null): DropIntent =>
  ({ kind: 'refused', reason, parentId, nodeId });

const subtreeIds = (doc: HudLayout, node: HudNode): Set<string> =>
  new Set(walkNodes({ ...doc, screen: node as HudContainer }).map((site) => site.node.id));

const isEmbedHost = (node: HudNode): boolean =>
  node.kind === 'element' && (node.element.type === 'repeat' || node.element.type === 'switch');

const inDocumentOrder = (doc: HudLayout, ids: readonly string[]): string[] => {
  const wanted = new Set(ids);
  return walkNodes(doc).filter((site) => wanted.has(site.node.id)).map((site) => site.node.id);
};

const moveAll = (doc: HudLayout, ids: readonly string[], parentId: string, index: number): HudLayout =>
  inDocumentOrder(doc, ids).reduce((next, id, i) => moveNode(next, id, parentId, index + i), doc);

const refusalFor = (
  doc: HudLayout, ids: readonly string[], parentId: string, place?: HudPlace,
): { reason: Refusal; nodeId: string | null } | null => {
  const target = siteOf(doc, parentId);
  for (const id of ids) {
    const site = siteOf(doc, id);
    if (!site || !site.parent) return { reason: 'source-locked', nodeId: id };
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

const outlineIntent = (doc: HudLayout, rowId: string, zone: DropZone, ids: readonly string[]): DropIntent => {
  const site = siteOf(doc, rowId);
  if (!site) return refused('not-a-container', null, rowId);
  const inside = zone === 'inside-start' || zone === 'inside-end';
  const parentId = inside ? rowId : site.parent?.id ?? null;
  if (!parentId) return refused(inside ? 'not-a-container' : 'source-locked', null, rowId);
  const stop = refusalFor(doc, ids, parentId);
  if (stop) return refused(stop.reason, parentId, stop.nodeId);
  const container = siteOf(doc, parentId)?.node as HudContainer;
  if (inside) return { kind: 'flex', parentId, index: zone === 'inside-start' ? 0 : container.children.length };
  return { kind: 'flex', parentId, index: site.index + (zone === 'after' ? 1 : 0) };
};

const applyDrop = (doc: HudLayout, ids: readonly string[], intent: DropIntent): HudLayout => {
  if (intent.kind === 'refused') return doc;
  const ordered = inDocumentOrder(doc, ids);
  const reparented = ordered.filter((id) => siteOf(doc, id)?.parent?.id !== intent.parentId);
  if (intent.kind === 'flex') {
    const moved = moveAll(doc, ordered, intent.parentId, intent.index);
    return reparented.reduce((next, id) => patchNode(next, id, { place: undefined }), moved);
  }
  const target = siteOf(doc, intent.parentId)?.node;
  const at = target?.kind === 'container' ? target.children.length : 0;
  const moved = moveAll(doc, ordered, intent.parentId, at);
  return ordered.reduce((next, id) => patchNode(next, id, { place: intent.place }), moved);
};

const refusalText = (doc: HudLayout, ids: readonly string[], intent: DropIntent): string | null => {
  if (intent.kind !== 'refused') return null;
  const name = (id: string | null): string => (id && siteOf(doc, id) ? id : 'that');
  const dragged = name(ids[0] ?? null);
  const other = name(intent.nodeId);
  switch (intent.reason) {
    case 'self': return `can't drop ${dragged} into itself`;
    case 'descendant': return `${other} is already inside ${dragged}`;
    case 'not-a-container': return `${other} can't hold anything`;
    case 'source-locked': return `${dragged} is set in Content, not by dragging`;
    case 'target-locked': return `a repeat's child is set in Content`;
    case 'grid-column': return `${other} has no such column`;
    default: return `would expand past the ${MAX_EXPANDED_NODES}-node cap`;
  }
};

export { applyDrop, outlineIntent, refusalFor, refusalText, zoneIn };
export type { DropIntent, DropZone, Refusal } from './drop-intent.type';
