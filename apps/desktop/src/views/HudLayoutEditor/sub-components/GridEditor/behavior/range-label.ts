/* @layer renderer-components @kind logic */
import type { Translate } from '@app/hud-layout-editing/translate.type';
import type { TrackAxis } from '../GridEditor.type';

const rangeLabel = (axis: TrackAxis, indices: readonly number[], t: Translate): string => {
  const first = Math.min(...indices) + 1;
  const last = Math.max(...indices) + 1;
  if (axis === 'columns') {
    return first === last
      ? t('hud-editor:grid.range.column', { n: first })
      : t('hud-editor:grid.range.columns', { first, last });
  }
  return first === last
    ? t('hud-editor:grid.range.row', { n: first })
    : t('hud-editor:grid.range.rows', { first, last });
};

export { rangeLabel };
