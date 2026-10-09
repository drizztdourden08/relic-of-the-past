/* @layer renderer-components @kind constants */
import type { GridAction } from '../GridEditor.type';

const GESTURES: GridAction[] = [
  { key: 'pick', kind: 'gesture', label: 'select', shortcut: { mouse: 'left' } },
  { key: 'add-to', kind: 'gesture', label: 'add', shortcut: { keys: ['mod'], mouse: 'left' } },
  { key: 'range', kind: 'gesture', label: 'range', shortcut: { keys: ['shift'], mouse: 'left' } },
  { key: 'rectangle', kind: 'gesture', label: 'rectangle', shortcut: { mouse: 'drag' } },
];

export { GESTURES };
