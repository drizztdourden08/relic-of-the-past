/* @layer renderer-components @kind types */
interface BugReportDialogProps {
  open: boolean;
  onClose: () => void;
  /** The active profile, if any. A debug report (save states + picked recordings) is only
   *  attempted when this is set AND debug logging is on - checked inside the dialog itself,
   *  since that gate is a live setting, not something the caller should have to track. */
  profileId: string | null;
}

export type { BugReportDialogProps };
