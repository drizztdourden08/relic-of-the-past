/* @layer renderer-components @kind types */
interface FfmpegRequiredDialogProps {
  open: boolean;
  /** Fired once, either when the tool becomes ready or the user skips - never both. */
  onClose: () => void;
}

export type { FfmpegRequiredDialogProps };
