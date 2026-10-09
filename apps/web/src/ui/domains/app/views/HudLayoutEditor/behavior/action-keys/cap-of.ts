/* @layer renderer-components @kind logic */
import { ACTION_KEY } from './action-keys.constants';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import type { ShortcutKey } from '@drizztdourden08/tessera/primitives';

const capOf = (event: ReactKeyboardEvent): ShortcutKey | null => ACTION_KEY[event.key] ?? null;

export { capOf };
