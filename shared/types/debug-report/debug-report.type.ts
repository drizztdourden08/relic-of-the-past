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

interface DebugReportSaveEntry {
  kind: 'quick' | 'normal' | 'auto' | 'live';
  ref: string;
  savedAt: number;
  buffer: ArrayBuffer;
}

interface DebugReportPackageInput {
  profileId: string;
  saves: DebugReportSaveEntry[];
  sessionKeys: string[];
}

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

type DebugReportBuildResult =
  | { reportId: string }
  | { error: string };

export type {
  DebugCaptureSnapshot,
  DebugCaptureScreenshot,
  DebugCaptureFinalizeInput,
  DebugCaptureFinalizeResult,
  DebugReportSaveEntry,
  DebugReportPackageInput,
  DebugCaptureSessionSummary,
  DebugCaptureDeleteSessionResult,
  DebugReportBuildResult,
};
