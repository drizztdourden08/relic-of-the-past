/* @layer renderer-components @kind logic */
import { refusalText } from '../drop-intent';
import { siteOf } from '../node-edits';
import { nodeName } from '../node-name';
import { enclosingRepeatOf } from '../tree-context';
import { containerKind } from './container-kind';
import { pathTo } from './path-to';
import type { DropIntent } from '../drop-intent';
import type { HudLayout } from '@rotp/hud';
import type { Translate } from '../translate.type';
import type { GhostModel } from './drop-ghost.type';

const repeatWarning = (doc: HudLayout, id: string, t: Translate): string | null => {
  const repeat = enclosingRepeatOf(doc, id);
  if (!repeat) return null;
  return typeof repeat.count === 'number'
    ? t('hud-editing:ghost.inside-repeat-count', { count: repeat.count })
    : t('hud-editing:ghost.inside-repeat');
};

const flexPosition = (doc: HudLayout, at: { parentId: string; index: number }, ids: readonly string[], t: Translate): string => {
  const { parentId, index } = at;
  const target = siteOf(doc, parentId)?.node;
  const children = target?.kind === 'container' ? target.children : [];
  const leaving = ids.filter((id) => children.some((child) => child.id === id)).length;
  return t('hud-editing:ghost.position', { n: index + 1, total: children.length - leaving + 1 });
};

const gridPosition = (place: { column?: number; row?: number }, onto: string | null, t: Translate): string =>
  (onto
    ? t('hud-editing:ghost.cell-with', { column: place.column ?? 1, row: place.row ?? 1, onto: nodeName(onto, t) })
    : t('hud-editing:ghost.cell-empty', { column: place.column ?? 1, row: place.row ?? 1 }));

const ghostFor = (doc: HudLayout, ids: readonly string[], intent: DropIntent, t: Translate): GhostModel => {
  const chip = ids[0] ? nodeName(ids[0], t) : '';
  if (intent.kind === 'refused') {
    return {
      tone: 'refused',
      chip,
      kind: t('hud-editing:ghost.refused-kind'),
      position: refusalText(doc, ids, intent, t) ?? t('hud-editing:ghost.refused-kind'),
      path: intent.parentId ? pathTo(doc, intent.parentId, t) : '',
      warn: false,
    };
  }
  const target = siteOf(doc, intent.parentId)?.node;
  const kind = containerKind(target ?? null, intent.parentId === doc.screen.id, t);
  const warning = repeatWarning(doc, intent.parentId, t);
  return {
    tone: 'move',
    chip,
    kind: t('hud-editing:ghost.into', { kind }),
    position: intent.kind === 'flex'
      ? flexPosition(doc, intent, ids, t)
      : gridPosition(intent.place, intent.onto, t),
    path: warning ?? pathTo(doc, intent.parentId, t),
    warn: warning !== null,
  };
};

export { ghostFor };
