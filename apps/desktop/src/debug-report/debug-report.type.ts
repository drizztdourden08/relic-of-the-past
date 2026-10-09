/* @layer shared-types @kind types */
interface DebugCaptureSnapshot {
  session: number;
  capturedAt: number;
  screenId: string;
  isIndoors: boolean;
  roomIndex: number;
  isDarkWorld: boolean;
  overworldScreenIndex: number;
  palaceIndex: number;
  whichEntrance: number;
  playerX: number;
  playerY: number;
}

interface DebugCaptureScreenshot {
  session: number;
  capturedAt: number;
  png: ArrayBuffer;
}

interface DebugCaptureFinalizeInput {
  profileId: string;
  sessionKey: string;
  snapshots: DebugCaptureSnapshot[];
  screenshots: DebugCaptureScreenshot[];
}

type DebugCaptureFinalizeResult =
  | { ok: true }
  | { error: string };

interface DebugCaptureSessionSummary {
  sessionKey: string;
  startedAt: number;
  sizeBytes: number;
  previewUrl: string | null;
  previewFrameUrls: string[];
  previewKind: 'video' | 'images' | 'none';
  sentAt: number | null;
}

type DebugCaptureDeleteSessionResult =
  | { ok: true }
  | { error: string };

export type {
  DebugCaptureSnapshot,
  DebugCaptureScreenshot,
  DebugCaptureFinalizeInput,
  DebugCaptureFinalizeResult,
  DebugCaptureSessionSummary,
  DebugCaptureDeleteSessionResult,
};
