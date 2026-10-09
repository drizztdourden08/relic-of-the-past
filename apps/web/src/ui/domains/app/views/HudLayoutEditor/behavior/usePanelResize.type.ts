/* @layer renderer-components @kind types */
import type { RefObject } from 'react';
import type { ResizeBinding } from '@drizztdourden08/tessera/primitives';

interface PanelResize {
  outlineWidth: number;
  inspectorWidth: number;
  outlineRailRef: RefObject<HTMLElement | null>;
  inspectorRailRef: RefObject<HTMLElement | null>;
  outlineResize: ResizeBinding;
  inspectorResize: ResizeBinding;
}

export type { PanelResize };
