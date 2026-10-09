/* @layer renderer-components @kind types */
import type { ArmedAction } from '../../behavior/useArmedAction';

interface SlotActionButtonProps {
  action: ArmedAction;
  glyph: string;
  label: string;
  shortcutHint?: string;
  disabled?: boolean;
  armed: boolean;
  onPress: () => void;
  onDisarm: () => void;
}

export type { SlotActionButtonProps };
