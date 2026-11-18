/* @layer renderer-components @kind logic */
import { MAX_EXPANDED_NODES } from '@rotp/hud';
import { siteOf } from '../node-edits';
import type { HudLayout } from '@rotp/hud';
import type { Translate } from '../translate.type';
import type { DropIntent } from './drop-intent.type';

const refusalText = (doc: HudLayout, ids: readonly string[], intent: DropIntent, t: Translate): string | null => {
  if (intent.kind !== 'refused') return null;
  const name = (id: string | null): string => (id && siteOf(doc, id) ? id : t('hud-editing:refusal.that'));
  const dragged = name(ids[0] ?? null);
  const other = name(intent.nodeId);
  switch (intent.reason) {
    case 'self': return t('hud-editing:refusal.self', { dragged });
    case 'descendant': return t('hud-editing:refusal.descendant', { other, dragged });
    case 'not-a-container': return t('hud-editing:refusal.not-a-container', { other });
    case 'source-locked': return t('hud-editing:refusal.source-locked', { dragged });
    case 'target-locked': return t('hud-editing:refusal.target-locked');
    case 'grid-column': return t('hud-editing:refusal.grid-column', { other });
    case 'budget': return t('hud-editing:refusal.budget', { max: MAX_EXPANDED_NODES });
  }
};

export { refusalText };
