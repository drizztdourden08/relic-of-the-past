/* @layer renderer-components @kind logic */
import type { KeyboardEvent } from 'react';

const isUndoKey = (event: Pick<KeyboardEvent, 'key' | 'ctrlKey' | 'metaKey'>): boolean =>
  (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z';

export { isUndoKey };
