/* @layer shared-types @kind logic */
/** Types for the debug report tool (Contributor tab, gated by GameSettings.allowDebugLogging). */

/** One sample of exactly where Link and the game were, taken while capture is running.
 *  `session` numbers which start/stop cycle it belongs to (1, 2, ...): multiple recordings
 *  in the same report stay distinguishable instead of reading as one continuous session. */
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

/** One frame grabbed alongside a DebugCaptureSnapshot, only while capture is running. */
interface DebugCaptureScreenshot {
  session: number;
  capturedAt: number;
  png: ArrayBuffer;
}

/** One save state included in a report: every quick slot, the 5 newest normal saves, the 2
 *  newest auto-saves, and a fresh 'live' capture taken at the moment the report was sent (never
 *  written to the profile's own save stores). */
interface DebugReportSaveEntry {
  kind: 'quick' | 'normal' | 'auto' | 'live';
  /** Quick-save slot number, the normal/auto save's id, or 'live', stringified. */
  ref: string;
  savedAt: number;
  buffer: ArrayBuffer;
}

/** What the renderer sends to the main process to build (but not yet send) the report. */
interface DebugReportPackageInput {
  profileId: string;
  saves: DebugReportSaveEntry[];
  navCaptures: DebugCaptureSnapshot[];
  captureScreenshots: DebugCaptureScreenshot[];
}

/** Building is local-only (collect files, zip, encode capture video) and never touches the
 *  network, so it gets its own result type: a token for the zip the main process is holding
 *  in memory, to hand to 'debug-report:send' once, or retry as many times as the upload
 *  itself fails without repeating any of this work. */
type DebugReportBuildResult =
  | { token: string }
  | { error: string };

type DebugReportUploadResult =
  | { reportId: string }
  | { error: string };

export type {
  DebugCaptureSnapshot,
  DebugCaptureScreenshot,
  DebugReportSaveEntry,
  DebugReportPackageInput,
  DebugReportBuildResult,
  DebugReportUploadResult,
};
