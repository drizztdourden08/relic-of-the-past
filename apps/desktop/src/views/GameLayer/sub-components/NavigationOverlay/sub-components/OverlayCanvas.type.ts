/* @layer renderer-components @kind types */
import type React from 'react';
import type { Props, MouseState } from '@app/navigation-overlay/navigation-overlay.type';

interface OverlayCanvasProps extends Props {
  mouseStateRef: React.RefObject<MouseState>;
}

export type { OverlayCanvasProps };
