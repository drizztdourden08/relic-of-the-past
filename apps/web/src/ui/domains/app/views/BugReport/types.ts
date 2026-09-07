/* @layer renderer-components @kind types */
interface BugReportDialogProps {
  open: boolean;
  onClose: () => void;
  /** Set when opened from the floating debug-report button: the id of the .zip already
   *  uploaded for the current save state, folded into the issue body on submit. */
  debugReportId?: string | null;
}

export type { BugReportDialogProps };
