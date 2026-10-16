/* @layer renderer-app @kind types */
import type { BugReportSectionProps } from '@drizztdourden08/brock-react';
import type { DebugCaptureSessionSummary } from '@app/debug-report';

type BugReportRecordingsProps = BugReportSectionProps;

interface RecordingsModel {
  sessions: DebugCaptureSessionSummary[];
  loading: boolean;
  selected: ReadonlySet<string>;
  showSent: boolean;
  error: string | null;
  toggleSession: (sessionKey: string) => void;
  toggleShowSent: (showSent: boolean) => void;
  deleteSession: (sessionKey: string) => void;
}

export type { BugReportRecordingsProps, RecordingsModel };
