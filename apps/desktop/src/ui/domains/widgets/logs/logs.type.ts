/* @layer renderer-widgets @kind types */
interface LogsToolbarProps {
  selectionCount: number;
  onCopyAll: () => void;
  onCopySelection: () => void;
  onCopyErrors: () => void;
}

export type { LogsToolbarProps };
