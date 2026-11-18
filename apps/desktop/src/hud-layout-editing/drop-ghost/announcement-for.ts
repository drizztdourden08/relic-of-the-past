/* @layer renderer-components @kind logic */
import type { Translate } from '../translate.type';
import type { GhostModel } from './drop-ghost.type';

const announcementFor = (model: GhostModel, t: Translate): string => (
  model.tone === 'refused'
    ? t('hud-editing:ghost.refused', { chip: model.chip, position: model.position })
    : t('hud-editing:ghost.moved', { chip: model.chip, kind: model.kind, position: model.position })
);

export { announcementFor };
