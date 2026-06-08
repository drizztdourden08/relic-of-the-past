/* @layer renderer-components @kind types */
interface AboutDialogProps {
  open: boolean;
  version: string;
  onClose: () => void;
}

export type { AboutDialogProps };
