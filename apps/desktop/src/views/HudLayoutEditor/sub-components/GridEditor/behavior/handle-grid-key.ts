/* @layer renderer-components @kind logic */
import { capOf, runnerFor } from '@app/hud-layout-editing/action-keys';
import { moveCursor } from './move-cursor';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import type { GridKeyParams } from '../GridEditor.type';

const handleGridKey = (event: ReactKeyboardEvent, params: GridKeyParams): boolean => {
  const label = capOf(event);
  if (label === null) return false;
  const match = runnerFor(params.actions, label);
  if (match?.run) {
    match.run();
    return true;
  }
  return moveCursor(params, event);
};

export { handleGridKey };
