/* @layer renderer-components @kind types */
import type { DebugCaptureSessionSummary } from '@shared/types/debug-report';

interface CaptureSessionPickerProps {
  sessions: DebugCaptureSessionSummary[];
  loading: boolean;
  selected: Set<string>;
  showSent: boolean;
  deleteError: string | null;
  onToggleSession: (sessionKey: string) => void;
  onToggleShowSent: () => void;
  onDeleteSession: (sessionKey: string) => void;
}

interface CaptureSessionRowProps {
  session: DebugCaptureSessionSummary;
  checked: boolean;
  onToggle: (sessionKey: string) => void;
  onRequestDelete: (sessionKey: string) => void;
}

export type { CaptureSessionPickerProps, CaptureSessionRowProps };
