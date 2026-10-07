/* @layer renderer-components @kind types */
interface OptimizeDialogProps {
  open: boolean;
  pack: string;
  onClose: () => void;
  /** Fired the moment a run settles, success or failure, so the pack's files and manifest are re-read. */
  onConverted: () => void;
}

export type { OptimizeDialogProps };
