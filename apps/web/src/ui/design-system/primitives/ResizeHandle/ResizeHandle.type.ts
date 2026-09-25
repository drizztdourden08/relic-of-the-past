/* @layer renderer-components @kind types */
import type { ResizeBinding } from './behavior/use-resize';

interface ResizeHandleProps {
  /** Named for the screen reader, because the strip itself shows no text. */
  label: string;
  /** 'horizontal' draws a vertical seam (drag left/right); 'vertical' draws a
   *  horizontal one (drag up/down). Matches the axis `resize` was built with. */
  axis: 'horizontal' | 'vertical';
  resize: ResizeBinding;
}

export type { ResizeHandleProps };
