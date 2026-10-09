/* @layer renderer-components @kind types */
import type { RefObject } from 'react';

interface SlotPickerPanelProps {
  open: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  slotNumbers: readonly number[];
  onClose: () => void;
  onPickItem?: (index: number) => void;
  onPickGlyph?: (index: number) => void;
  onPickNumber?: (index: number) => void;
}

export type { SlotPickerPanelProps };
