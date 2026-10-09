/* @layer renderer-components @kind types */
import type { RefObject } from 'react';
import type { ResizeBinding } from '@ds/primitives/ResizeHandle';

interface PanelResize {
  outlineWidth: number;
  inspectorWidth: number;
  outlineRailRef: RefObject<HTMLElement | null>;
  inspectorRailRef: RefObject<HTMLElement | null>;
  outlineResize: ResizeBinding;
  inspectorResize: ResizeBinding;
}

export type { PanelResize };
