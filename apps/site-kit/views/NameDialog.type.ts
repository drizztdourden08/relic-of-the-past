/* @layer site-kit @kind types */
type NameDialogProps = {
  open: boolean;
  title: string;
  confirmLabel: string;
  initialValue?: string;
  onConfirm: (name: string) => void;
  onCancel: () => void;
};

export type { NameDialogProps };
