/* @layer renderer-components @kind types */
import type { ArmedAction } from './behavior/useArmedAction.type';

interface ArmedActionButtonProps {
  action: ArmedAction;
  label: string;
  caption?: string;
  shortcutHint?: string;
  disabled?: boolean;
  disabledReason?: string;
  armed: boolean;
  tabIndex?: number;
  onPress: () => void;
  onDisarm: () => void;
}

export type { ArmedActionButtonProps };
