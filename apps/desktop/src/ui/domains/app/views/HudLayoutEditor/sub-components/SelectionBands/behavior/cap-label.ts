/* @layer renderer-components @kind logic */
import { primaryModifierLabel } from '@shared/platform/primary-modifier-label';
import type { ShortcutKey } from '@drizztdourden08/tessera/primitives';
import type { OsKind } from '@drizztdourden08/brock-core';
import type { EditorKey } from '../selection-bands.type';

const capLabel = (key: EditorKey, os: OsKind): ShortcutKey => {
  if (key !== 'mod') return key;
  return primaryModifierLabel(os) === 'Cmd' ? 'cmd' : 'ctrl';
};

export { capLabel };
