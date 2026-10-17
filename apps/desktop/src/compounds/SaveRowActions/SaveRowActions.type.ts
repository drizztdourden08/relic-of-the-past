/* @layer renderer-components @kind types */
interface SaveRowActionsProps {
  name: string;
  resetKey: string;
  busy: boolean;
  tabIndex?: number;
  overwriteDisabledReason?: string;
  onLoad: () => void;
  onOverwrite?: () => void;
  onDelete: () => void;
}

export type { SaveRowActionsProps };
