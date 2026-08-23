/* @layer renderer-components @kind types */
import type { RefObject } from 'react';
import type { ColorPickerProps } from '../ColorPicker';

interface ColorPickerPopoverProps extends Omit<ColorPickerProps, 'onClose'> {
  open: boolean;
  /** The trigger to float beside — set to whichever swatch was last clicked. */
  anchorRef: RefObject<HTMLElement | null>;
  onClose: () => void;
}

export type { ColorPickerPopoverProps };
