/* @layer renderer-components @kind types */
type SubmitStatus = 'idle' | 'submitting' | 'done' | 'error';
type UploadStatus = 'idle' | 'uploading' | 'done' | 'error';

interface FiledReport {
  reportId: string;
  issueUrl: string;
  sanctuaryUrl: string;
}

interface BugReportDialogProps {
  open: boolean;
  onClose: () => void;
  profileId: string | null;
}

interface DebugInfoPreviewProps {
  text: string | null;
}

interface ReportFiledPanelProps {
  issueUrl: string;
  uploadStatus: UploadStatus;
  uploadError: string | null;
  onRetryUpload: () => void;
}

export type {
  BugReportDialogProps, DebugInfoPreviewProps, FiledReport, ReportFiledPanelProps, SubmitStatus, UploadStatus,
};
