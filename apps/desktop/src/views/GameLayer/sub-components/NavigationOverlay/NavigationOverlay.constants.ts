/* @layer renderer-components @kind constants */
import type { CSSProperties } from 'react';
import type { MouseState } from '@app/navigation-overlay/navigation-overlay.type';

const LAYOUT_STYLES: Record<string, CSSProperties> = {
  overlay: { position: 'absolute', inset: 0, zIndex: 6 },
  controls: { position: 'absolute', top: 6, left: 6, zIndex: 7, pointerEvents: 'none' },
  legends: {
    position: 'absolute', bottom: 6, right: 6, zIndex: 7,
    display: 'flex', gap: 6, alignItems: 'flex-end', pointerEvents: 'none',
  },
  legendColumn: { display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'stretch' },
};

const INITIAL_MOUSE_STATE: MouseState = {
  leftHeld: false,
  lockTarget: false,
  hoverTile: null,
  lockedTile: null,
};

export { LAYOUT_STYLES, INITIAL_MOUSE_STATE };
