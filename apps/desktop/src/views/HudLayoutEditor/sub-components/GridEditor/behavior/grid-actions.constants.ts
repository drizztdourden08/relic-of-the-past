/* @layer renderer-components @kind constants */
import type { Translate } from '@app/hud-layout-editing/translate.type';
import type { GridAction } from '../GridEditor.type';

const gesturesOf = (t: Translate): GridAction[] => [
  { key: 'pick', kind: 'gesture', label: t('hud-editor:grid.gesture.select'), shortcut: { mouse: 'left' } },
  { key: 'add-to', kind: 'gesture', label: t('hud-editor:grid.gesture.add'), shortcut: { keys: ['mod'], mouse: 'left' } },
  { key: 'range', kind: 'gesture', label: t('hud-editor:grid.gesture.range'), shortcut: { keys: ['shift'], mouse: 'left' } },
  { key: 'rectangle', kind: 'gesture', label: t('hud-editor:grid.gesture.rectangle'), shortcut: { mouse: 'drag' } },
];

export { gesturesOf };
