/* @layer renderer-components @kind types */
interface OptimizeDialogProps {
  open: boolean;
  pack: string;
  onClose: () => void;
  /** Fired once a run has written something, so the pack's files are re-read. */
  onConverted: () => void;
}

export type { OptimizeDialogProps };
