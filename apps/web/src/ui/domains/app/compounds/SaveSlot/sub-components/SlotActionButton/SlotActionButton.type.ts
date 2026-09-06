/* @layer renderer-components @kind types */
import type { ArmedAction } from '../../behavior/useArmedAction';

interface SlotActionButtonProps {
  action: ArmedAction;
  /** Emoji drawn on the button. */
  glyph: string;
  /** Accessible name, e.g. "Load slot 3". */
  label: string;
  /** Keyboard shortcut shown in the tooltip, e.g. "F1" or "Shift+F1". */
  shortcutHint?: string;
  disabled?: boolean;
  /** First click landed; the next one confirms. */
  armed: boolean;
  onPress: () => void;
  onDisarm: () => void;
}

export type { SlotActionButtonProps };
