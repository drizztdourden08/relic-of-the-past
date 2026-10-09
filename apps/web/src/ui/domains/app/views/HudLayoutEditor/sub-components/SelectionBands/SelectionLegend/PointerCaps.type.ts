/* @layer renderer-components @kind types */
import type { OsKind } from '@shared/platform';
import type { EditorShortcut } from '../selection-bands.type';

interface PointerCapsProps {
  shortcut: EditorShortcut;
  os: OsKind;
}

export type { PointerCapsProps };
