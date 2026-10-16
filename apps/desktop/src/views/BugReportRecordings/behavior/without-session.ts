/* @layer renderer-app @kind logic */
import type { DebugCaptureSessionSummary } from '@app/debug-report';

const withoutSession = (list: DebugCaptureSessionSummary[], sessionKey: string): DebugCaptureSessionSummary[] =>
  list.filter((session) => session.sessionKey !== sessionKey);

export { withoutSession };
