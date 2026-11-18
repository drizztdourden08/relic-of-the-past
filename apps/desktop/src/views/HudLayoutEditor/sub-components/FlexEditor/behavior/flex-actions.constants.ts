/* @layer renderer-components @kind constants */
import type { Translate } from '@app/hud-layout-editing/translate.type';
import type { EditorAction } from '../FlexEditor.type';

const gesturesOf = (t: Translate): EditorAction[] => [
  { key: 'pick', kind: 'gesture', label: t('hud-editor:grid.gesture.select'), shortcut: { mouse: 'left' } },
  { key: 'add-to', kind: 'gesture', label: t('hud-editor:grid.gesture.add'), shortcut: { keys: ['mod'], mouse: 'left' } },
  { key: 'range', kind: 'gesture', label: t('hud-editor:grid.gesture.range'), shortcut: { keys: ['shift'], mouse: 'left' } },
];

export { gesturesOf };
