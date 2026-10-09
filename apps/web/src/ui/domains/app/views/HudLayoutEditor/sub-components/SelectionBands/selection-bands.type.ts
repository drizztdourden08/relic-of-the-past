/* @layer renderer-components @kind types */
import type { IconifyIcon } from '@iconify/types';
import type { MousePart } from '@ds/primitives/MouseGlyph';

interface EditorShortcut {
  keys?: readonly string[];
  mouse?: MousePart;
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

export type { EditorAction, EditorActionKind, EditorShortcut, LegendEntry };
