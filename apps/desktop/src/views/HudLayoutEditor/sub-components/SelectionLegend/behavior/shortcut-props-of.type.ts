/* @layer renderer-components @kind types */
import type { MouseButton, ShortcutKey } from '@drizztdourden08/tessera/primitives';

interface ShortcutPropsOf {
  keys: ShortcutKey[];
  mouse?: MouseButton;
}

export type { ShortcutPropsOf };
