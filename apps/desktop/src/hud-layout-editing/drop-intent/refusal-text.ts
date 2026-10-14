/* @layer renderer-components @kind logic */
import { MAX_EXPANDED_NODES } from '@rotp/hud';
import { siteOf } from '../node-edits';
import type { HudLayout } from '@rotp/hud';
import type { DropIntent } from './drop-intent.type';

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
    case 'budget': return `would expand past the ${MAX_EXPANDED_NODES}-node cap`;
  }
};

export { refusalText };
