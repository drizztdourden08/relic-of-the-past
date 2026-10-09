/* @layer renderer-components @kind logic */
import { siteOf } from '../node-edits';
import { refusalFor } from './refusal-for';
import type { HudContainer, HudLayout } from '@rotp/hud';
import type { DropIntent, DropZone, Refusal } from './drop-intent.type';

const refused = (reason: Refusal, parentId: string | null, nodeId: string | null = null): DropIntent =>
  ({ kind: 'refused', reason, parentId, nodeId });

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

export { outlineIntent };
