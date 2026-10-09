/* @layer renderer-components @kind constants */
import type { ShortcutKey } from '@drizztdourden08/tessera/primitives';

const ACTION_KEY: Readonly<Record<string, ShortcutKey>> = {
  ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down', Delete: 'delete', Backspace: 'delete',
};

export { ACTION_KEY };
