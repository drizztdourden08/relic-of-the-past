/* @layer renderer-components @kind logic */
import { patchNode, siteOf } from '../node-edits';
import { inDocumentOrder } from './in-document-order';
import { moveAll } from './move-all';
import type { HudLayout } from '@rotp/hud';
import type { DropIntent } from './drop-intent.type';

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

export { applyDrop };
