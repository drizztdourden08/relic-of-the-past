/* @layer renderer-components @kind logic */
import { primaryModifierLabel } from '@rotp/input-mapping';
import type { ShortcutKey } from '@drizztdourden08/tessera/primitives';
import type { OsKind } from '@drizztdourden08/brock-core';
import type { EditorKey } from '@app/hud-layout-editing/selection-bands.type';

const capLabel = (key: EditorKey, os: OsKind): ShortcutKey => {
  if (key !== 'mod') return key;
  return primaryModifierLabel(os) === 'Cmd' ? 'cmd' : 'ctrl';
};

export { capLabel };
