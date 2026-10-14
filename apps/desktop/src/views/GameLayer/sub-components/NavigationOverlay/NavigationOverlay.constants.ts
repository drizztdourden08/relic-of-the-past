/* @layer renderer-components @kind constants */
import type { MouseState } from '@app/navigation-overlay/navigation-overlay.type';

const INITIAL_MOUSE_STATE: MouseState = {
  leftHeld: false,
  lockTarget: false,
  hoverTile: null,
  lockedTile: null,
};

export { INITIAL_MOUSE_STATE };
