/* @layer renderer-components @kind logic */
import { stepsAsNumber } from '@app/hud-layout-editing/value-text';
import type { KeyIntent } from './key-intent-of.type';

const keyIntentOf = (key: string, menuOpen: boolean, text: string): KeyIntent => {
  if (key === 'Escape') return menuOpen ? 'none' : 'cancel';
  if (key === 'Enter') return 'commit';
  if (!stepsAsNumber(text)) return 'none';
  if (key === 'ArrowUp') return 'up';
  return key === 'ArrowDown' ? 'down' : 'none';
};

export { keyIntentOf };
