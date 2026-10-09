/* @layer renderer-components @kind types */
import type { IconifyIcon } from '@iconify/types';
import type { MouseButton, ShortcutKey } from '@drizztdourden08/tessera/primitives';

type EditorKey = ShortcutKey | 'mod';

type EditorPointer = MouseButton | 'drag';

interface EditorShortcut {
  keys?: readonly EditorKey[];
  mouse?: EditorPointer;
}

type EditorActionKind = 'button' | 'gesture';

interface EditorAction {
  key: string;
  kind: EditorActionKind;
  icon?: IconifyIcon;
  label: string;
  shortcut?: EditorShortcut;
  group?: string;
  run?: () => void;
  disabled?: boolean;
}

interface LegendEntry { key: string; label: string; shortcut: EditorShortcut }

export type { EditorAction, EditorActionKind, EditorKey, EditorPointer, EditorShortcut, LegendEntry };
