/* @layer renderer-components @kind types */
interface SlotPickActionsProps {
  index?: number;
  disabled?: boolean;
  onPickNumber?: () => void;
  onPickItem: () => void;
  onPickGlyph: () => void;
}

export type { SlotPickActionsProps };
