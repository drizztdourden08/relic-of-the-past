/* @layer renderer-components @kind logic */
import { ARROW_GLYPH } from './action-keys.constants';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';

const capOf = (event: ReactKeyboardEvent): string | null => {
  const arrow = ARROW_GLYPH[event.key];
  if (arrow) return arrow;
  if (event.key === 'Delete' || event.key === 'Backspace') return 'Del';
  return null;
};

export { capOf };
