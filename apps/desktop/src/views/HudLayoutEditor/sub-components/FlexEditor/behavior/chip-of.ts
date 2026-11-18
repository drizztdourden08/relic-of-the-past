/* @layer renderer-components @kind logic */
import type { Translate } from '@app/hud-layout-editing/translate.type';
import type { FlexSelection } from '../FlexEditor.type';

const chipOf = (selection: FlexSelection, t: Translate): string | null => {
  if (selection.kind === 'none') return null;
  return selection.indices.length === 1
    ? t('hud-editor:flex.chip.item', { n: Math.min(...selection.indices) + 1 })
    : t('hud-editor:flex.chip.items', { count: selection.indices.length });
};

export { chipOf };
