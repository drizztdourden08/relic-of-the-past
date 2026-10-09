/* @layer renderer-components @kind logic */
import { refusalText } from '../drop-intent';
import { siteOf } from '../node-edits';
import { enclosingRepeatOf } from '../tree-context';
import { containerKind } from './container-kind';
import { pathTo } from './path-to';
import type { DropIntent } from '../drop-intent';
import type { HudLayout } from '@shared/types/hud';
import type { GhostModel } from './drop-ghost.type';

const repeatWarning = (doc: HudLayout, id: string): string | null => {
  const repeat = enclosingRepeatOf(doc, id);
  if (!repeat) return null;
  return typeof repeat.count === 'number' ? `inside repeat ×${repeat.count}` : 'inside repeat';
};

const flexPosition = (doc: HudLayout, parentId: string, index: number, ids: readonly string[]): string => {
  const target = siteOf(doc, parentId)?.node;
  const children = target?.kind === 'container' ? target.children : [];
  const leaving = ids.filter((id) => children.some((child) => child.id === id)).length;
  return `position ${index + 1} of ${children.length - leaving + 1}`;
};

const gridPosition = (place: { column?: number; row?: number }, onto: string | null): string =>
  `cell ${place.column ?? 1},${place.row ?? 1} ${onto ? `· with ${onto}` : '· empty'}`;

const ghostFor = (doc: HudLayout, ids: readonly string[], intent: DropIntent): GhostModel => {
  const chip = ids[0] ?? '';
  if (intent.kind === 'refused') {
    return {
      tone: 'refused',
      chip,
      kind: 'refused',
      position: refusalText(doc, ids, intent) ?? 'refused',
      path: intent.parentId ? pathTo(doc, intent.parentId) : '',
      warn: false,
    };
  }
  const target = siteOf(doc, intent.parentId)?.node;
  const kind = containerKind(target ?? null, intent.parentId === doc.screen.id);
  const warning = repeatWarning(doc, intent.parentId);
  return {
    tone: 'move',
    chip,
    kind: `into ${kind}`,
    position: intent.kind === 'flex'
      ? flexPosition(doc, intent.parentId, intent.index, ids)
      : gridPosition(intent.place, intent.onto),
    path: warning ?? pathTo(doc, intent.parentId),
    warn: warning !== null,
  };
};

export { ghostFor };
