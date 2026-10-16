/* @layer renderer-app @kind component */
import { useBugReportStore, useProfilesStore } from '@drizztdourden08/brock-react';
import { debugLoggingOn } from '@app/bug-report/debug-logging-on';
import { RecordingsPicker } from './sub-components/RecordingsPicker';
import type { BugReportRecordingsProps } from './BugReportRecordings.type';
import './BugReportRecordings.css';

const BugReportRecordings = (props: BugReportRecordingsProps) => {
  const { setExtras, disabled } = props;
  const profileId = useProfilesStore((s) => s.active?.id ?? null);
  const hasSnapshot = useBugReportStore((s) => s.extras !== null);
  if (!hasSnapshot || profileId === null || !debugLoggingOn()) return null;
  return <RecordingsPicker profileId={profileId} setExtras={setExtras} disabled={disabled} />;
};

export { BugReportRecordings };
