/* @layer renderer-app @kind logic */
import { formatDate } from '@drizztdourden08/tessera/primitives';
import type { DebugCaptureSessionSummary } from '@app/debug-report';
import { TIME_FORMAT } from '../BugReportRecordings.constants';

const recordingName = (session: DebugCaptureSessionSummary): string => formatDate(session.startedAt, TIME_FORMAT);

export { recordingName };
