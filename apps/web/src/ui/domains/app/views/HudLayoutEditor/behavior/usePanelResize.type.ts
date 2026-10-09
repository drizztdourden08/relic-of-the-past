/* @layer renderer-components @kind types */
import type { ResizeHandleProps } from '@drizztdourden08/tessera/composites';

type PanelResizeBinding = Pick<ResizeHandleProps, 'value' | 'min' | 'max' | 'onResize'>;

interface PanelResize {
  outlineWidth: number;
  inspectorWidth: number;
  outlineResize: PanelResizeBinding;
  inspectorResize: PanelResizeBinding;
}

export type { PanelResize, PanelResizeBinding };
