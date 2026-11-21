/* @layer renderer-app @kind logic */
import { formatDate } from '@drizztdourden08/tessera/primitives';
import type { DateFormatOptions } from '@drizztdourden08/tessera/primitives';
import type { DebugCaptureSessionSummary } from '@app/debug-report';

const recordingName = (session: DebugCaptureSessionSummary, dates: DateFormatOptions): string => formatDate(session.startedAt, 'datetime', dates);

export { recordingName };
