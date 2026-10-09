/* @layer renderer-components @kind logic */
import type { GhostModel } from './drop-ghost.type';

const announcementFor = (model: GhostModel): string => (
  model.tone === 'refused'
    ? `can't move ${model.chip}. ${model.position}`
    : `${model.chip} moved ${model.kind}, ${model.position}`
);

export { announcementFor };
