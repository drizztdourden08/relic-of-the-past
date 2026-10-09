/* @layer renderer-widgets @kind logic */
import { MOUSE_OF } from './shortcut-of.constants';
import type { ControlHint, ControlShortcut } from '../sub-components/ControlHint.type';

const shortcutOf = (hint: ControlHint): ControlShortcut =>
  (hint.glyph === 'key' ? { keys: hint.keyName } : { mouse: MOUSE_OF[hint.glyph] });

export { shortcutOf };
