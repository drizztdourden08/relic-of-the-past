/* @layer renderer-components @kind logic */
import type { Translate } from '@app/hud-layout-editing/translate.type';
import { ANCHORS } from './grid-status.constants';

const anchorName = (t: Translate, columns: number, rows: number, column: number, row: number): string => {
  const anchor = columns === 3 && rows === 3 ? ANCHORS[(row - 1) * 3 + (column - 1)] : undefined;
  return anchor === undefined ? '' : t('hud-editor:grid.status.anchor', { name: t(anchor) });
};

export { anchorName };
