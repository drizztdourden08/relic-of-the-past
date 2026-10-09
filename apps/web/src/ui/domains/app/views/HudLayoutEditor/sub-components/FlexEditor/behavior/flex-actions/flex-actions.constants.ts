/* @layer renderer-components @kind constants */
import type { EditorAction } from '../../FlexEditor.type';

const GESTURES: EditorAction[] = [
  { key: 'pick', kind: 'gesture', label: 'select', shortcut: { mouse: 'left' } },
  { key: 'add-to', kind: 'gesture', label: 'add', shortcut: { keys: ['mod'], mouse: 'left' } },
  { key: 'range', kind: 'gesture', label: 'range', shortcut: { keys: ['shift'], mouse: 'left' } },
];

const MANY = 'Pick one child to move. A run has no single place to land.';

export { GESTURES, MANY };
