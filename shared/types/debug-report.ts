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

/** What the renderer hands off the moment a recording stops: the raw frames and the
 *  position timeline for that one session, keyed by `sessionKey` (its own folder under
 *  debug-captures/<profileId>/). Finalizing writes both to disk and encodes them into a
 *  video immediately - packaging a report never waits on this, it just zips up whatever
 *  session folders already exist. */
interface DebugCaptureFinalizeInput {
  profileId: string;
  sessionKey: string;
  snapshots: DebugCaptureSnapshot[];
  screenshots: DebugCaptureScreenshot[];
}

type DebugCaptureFinalizeResult =
  | { ok: true }
  | { error: string };

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

/** What the renderer sends to the main process to build (but not yet send) the report.
 *  `sessionKeys` is exactly what the picker had checked - not "every eligible session",
 *  since which capture sessions ship is now the player's choice. */
interface DebugReportPackageInput {
  profileId: string;
  saves: DebugReportSaveEntry[];
  sessionKeys: string[];
}

/** One recorded capture session as the picker lists it: enough to show a small preview,
 *  a timestamp, and whether it's already been shipped in an earlier report. `sentAt` comes
 *  from that profile's capture manifest, not from the session folder itself - deleting
 *  `packaged/` is no longer how "already sent" gets tracked (see capture-manifest.ts).
 *  `previewKind: 'images'` (no ffmpeg, PNG fallback) carries every packaged frame in
 *  `previewFrameUrls` so the picker can cycle through them as a fake video instead of
 *  freezing on frame one. */
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

/** Building is local-only (collect files, zip, sweep in finalized capture sessions) and
 *  never touches the network: it returns the id of the zip the main process is holding in
 *  memory, generated up front so it can be folded into the GitHub issue body before anything
 *  is uploaded. 'debug-report:send' takes that same id later, once the issue is confirmed
 *  created, and can be retried against it as many times as the upload itself fails. */
type DebugReportBuildResult =
  | { reportId: string }
  | { error: string };

type DebugReportUploadResult =
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
  DebugReportUploadResult,
};
