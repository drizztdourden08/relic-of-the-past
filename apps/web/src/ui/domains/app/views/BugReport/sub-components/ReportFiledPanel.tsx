/* @layer renderer-components @kind component */
import { Button, Text } from '@ds/primitives';
import type { UploadStatus } from '../behavior/useBugReportForm';

interface ReportFiledPanelProps {
  issueUrl: string;
  uploadStatus: UploadStatus;
  uploadError: string | null;
  onRetryUpload: () => void;
}

/** The body of the "Report filed" dialog: the issue link and the state of the attachment. */
const ReportFiledPanel = (props: ReportFiledPanelProps) => {
  const { issueUrl, uploadStatus, uploadError, onRetryUpload } = props;

  return (
    <>
      <Text as="p">Thanks! Your report was filed.</Text>
      <Text as="p" className="bug-report__result-url">{issueUrl}</Text>
      {uploadStatus === 'uploading' && (
        <Text as="p" className="bug-report__upload-status">Attaching the debug report...</Text>
      )}
      {uploadStatus === 'done' && (
        <Text as="p" className="bug-report__upload-status">Debug report attached.</Text>
      )}
      {uploadStatus === 'error' && (
        <>
          <Text as="p" className="bug-report__status bug-report__status--error">
            Couldn't attach the debug report{uploadError ? `: ${uploadError}` : ''}.
          </Text>
          <Button variant="secondary" onClick={onRetryUpload}>Retry upload</Button>
        </>
      )}
    </>
  );
};

export { ReportFiledPanel };
export type { ReportFiledPanelProps };
