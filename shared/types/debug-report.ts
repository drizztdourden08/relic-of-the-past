/* @layer shared-types @kind logic */
/** Types for the debug report tool (Contributor tab, gated by GameSettings.allowDebugLogging). */

/** One sample of exactly where Link and the game were, taken while capture is running. */
interface DebugCaptureSnapshot {
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

/** Which save state the floating button packaged, and where it came from. */
interface DebugReportSource {
  kind: 'quick' | 'normal' | 'auto';
  /** Quick-save slot number, or the normal/auto save's id, stringified. */
  ref: string;
  savedAt: number;
}

/** What the renderer sends to the main process to build and upload the report. */
interface DebugReportPackageInput {
  profileId: string;
  source: DebugReportSource;
  saveBuffer: ArrayBuffer;
  screenshotBase64: string | null;
  navCaptures: DebugCaptureSnapshot[];
}

type DebugReportUploadResult =
  | { reportId: string }
  | { error: string };

export type {
  DebugCaptureSnapshot,
  DebugReportSource,
  DebugReportPackageInput,
  DebugReportUploadResult,
};
