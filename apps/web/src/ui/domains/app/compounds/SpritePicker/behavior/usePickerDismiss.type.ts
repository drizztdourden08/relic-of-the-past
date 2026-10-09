/* @layer renderer-components @kind types */
import type { RefObject } from 'react';

interface UsePickerDismissParams {
  open: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  panelRef: RefObject<HTMLElement | null>;
  onClose: () => void;
}

export type { UsePickerDismissParams };
