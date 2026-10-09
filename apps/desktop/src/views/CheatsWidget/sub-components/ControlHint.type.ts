/* @layer renderer-widgets @kind types */
import type { MouseButton, ShortcutKey } from '@drizztdourden08/tessera/primitives';

type MouseGlyph = 'mouse-left' | 'mouse-right' | 'wheel';

type ControlHint =
  | { glyph: 'key'; keyName: ShortcutKey; label: string }
  | { glyph: MouseGlyph; label: string };

type ControlShortcut = { keys: ShortcutKey } | { mouse: MouseButton };

type ControlLegendProps = {
  items: readonly ControlHint[];
};

export type { ControlHint, ControlLegendProps, ControlShortcut, MouseGlyph };
