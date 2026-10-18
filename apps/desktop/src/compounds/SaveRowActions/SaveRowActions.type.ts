/* @layer renderer-components @kind types */
import type { ArmedAction } from '../ArmedActionButton';

interface SaveRowActionsProps {
  name: string;
  busy: boolean;
  tabIndex?: number;
  overwriteDisabledReason?: string;
  onLoad: () => void;
  onOverwrite?: () => void;
  onDelete: () => void;
  onArmedChange?: (armed: ArmedAction | null) => void;
}

export type { SaveRowActionsProps };
