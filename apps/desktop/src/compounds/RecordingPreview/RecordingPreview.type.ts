/* @layer renderer-components @kind types */
import type { DebugCaptureSessionSummary } from '@app/debug-report';

interface RecordingPreviewProps {
  session: DebugCaptureSessionSummary;
  label: string;
}

export type { RecordingPreviewProps };
