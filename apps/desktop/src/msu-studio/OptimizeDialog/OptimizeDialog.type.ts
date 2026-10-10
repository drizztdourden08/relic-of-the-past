/* @layer renderer-components @kind types */
interface OptimizeDialogProps {
  open: boolean;
  pack: string;
  onClose: () => void;
  onConverted: () => void;
}

export type { OptimizeDialogProps };
