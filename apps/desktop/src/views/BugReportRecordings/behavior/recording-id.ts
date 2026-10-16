/* @layer renderer-app @kind logic */
import type { DebugCaptureSessionSummary } from '@app/debug-report';

const recordingId = (session: DebugCaptureSessionSummary): string => session.sessionKey;

export { recordingId };
