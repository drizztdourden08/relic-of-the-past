/* @layer renderer-components @kind logic */
import type { GridPos, MouseState } from '@app/navigation-overlay/navigation-overlay.type';

const activePathTarget = (state: MouseState | undefined): GridPos | null => {
  if (!state) return null;
  if (state.lockTarget && state.lockedTile) return state.lockedTile;
  return state.leftHeld ? state.hoverTile : null;
};

export { activePathTarget };
