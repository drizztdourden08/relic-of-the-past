/* @layer renderer-components @kind logic */
import type { OsKind } from '@drizztdourden08/brock-core';
import type { EditorShortcut } from '@app/hud-layout-editing/selection-bands.type';
import { capLabel } from './cap-label';
import type { ShortcutPropsOf } from './shortcut-props-of.type';

const shortcutPropsOf = (shortcut: EditorShortcut, os: OsKind): ShortcutPropsOf => ({
  keys: (shortcut.keys ?? []).map((key) => capLabel(key, os)),
  ...(shortcut.mouse === undefined ? {} : { mouse: shortcut.mouse }),
});

export { shortcutPropsOf };
