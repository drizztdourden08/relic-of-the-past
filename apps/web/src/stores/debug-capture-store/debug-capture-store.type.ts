/* @layer renderer-stores @kind types */
import type { DebugCaptureSnapshot, DebugCaptureScreenshot } from '@shared/types/debug-report';

interface DebugCaptureStore {
  isCapturing: boolean;
  startedAt: number | null;
  session: number;
  profileId: string | null;
  snapshots: DebugCaptureSnapshot[];
  screenshots: DebugCaptureScreenshot[];
  start: (profileId: string) => void;
  stop: () => void;
  toggle: (profileId: string) => void;
}

export type { DebugCaptureStore };
