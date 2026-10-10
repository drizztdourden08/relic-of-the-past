/* @layer renderer-components @kind logic */
import { moveNode } from '../node-edits';
import { inDocumentOrder } from './in-document-order';
import type { HudLayout } from '@rotp/hud';

const moveAll = (doc: HudLayout, ids: readonly string[], parentId: string, index: number): HudLayout =>
  inDocumentOrder(doc, ids).reduce((next, id, i) => moveNode(next, id, parentId, index + i), doc);

export { moveAll };
