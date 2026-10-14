/* @layer renderer-components @kind logic */
import { siteOf } from '../node-edits';
import { refusalFor } from './refusal-for';
import type { HudContainer, HudLayout } from '@rotp/hud';
import type { DropIntent, DropZone, Refusal } from './drop-intent.type';

const refused = (reason: Refusal, parentId: string | null, nodeId: string | null = null): DropIntent =>
  ({ kind: 'refused', reason, parentId, nodeId });

const isInside = (zone: DropZone): boolean => zone === 'inside-start' || zone === 'inside-end';

const flexIntent = (doc: HudLayout, parentId: string, index: number, zone: DropZone): DropIntent => {
  if (!isInside(zone)) return { kind: 'flex', parentId, index: index + (zone === 'after' ? 1 : 0) };
  const container = siteOf(doc, parentId)?.node as HudContainer;
  return { kind: 'flex', parentId, index: zone === 'inside-start' ? 0 : container.children.length };
};

const outlineIntent = (doc: HudLayout, rowId: string, zone: DropZone, ids: readonly string[]): DropIntent => {
  const site = siteOf(doc, rowId);
  if (!site) return refused('not-a-container', null, rowId);
  const inside = isInside(zone);
  const parentId = inside ? rowId : site.parent?.id ?? null;
  if (!parentId) return refused(inside ? 'not-a-container' : 'source-locked', null, rowId);
  const stop = refusalFor(doc, ids, parentId);
  if (stop) return refused(stop.reason, parentId, stop.nodeId);
  return flexIntent(doc, parentId, site.index, zone);
};

export { outlineIntent };
