/* @layer renderer-app @kind hook */
import { useReportSnapshotOnOpen } from '@app/bug-report/useReportSnapshotOnOpen';
import { useSignedOutIssueFallback } from '@app/bug-report/useSignedOutIssueFallback';

const useSanctuaryBugReport = (): void => {
  useSignedOutIssueFallback();
  useReportSnapshotOnOpen();
};

export { useSanctuaryBugReport };
