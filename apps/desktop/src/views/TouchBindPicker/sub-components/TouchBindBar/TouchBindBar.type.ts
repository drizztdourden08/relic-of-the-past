/* @layer renderer-app @kind types */
interface TouchBindBarProps {
  actionLabel: string;
  onCancel: () => void;
  onDefault: (() => void) | null;
}

export type { TouchBindBarProps };
