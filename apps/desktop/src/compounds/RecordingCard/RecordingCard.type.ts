/* @layer renderer-components @kind types */
import type { DebugCaptureSessionSummary } from '@app/debug-report';

interface RecordingCardProps {
  session: DebugCaptureSessionSummary;
  checked: boolean;
  disabled?: boolean;
  onToggle: (sessionKey: string) => void;
  onDelete: (sessionKey: string) => void;
}

export type { RecordingCardProps };
