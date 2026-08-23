/* @layer shared-platform @kind logic */
/**
 * File-picker port: get a file's bytes in from the OS, and hand a file's bytes back out.
 * Electron uses its native dialogs; Capacitor a picker plugin and a share sheet; web an
 * `<input>` and a download link.
 *
 * `saveFile` reports a cancelled dialog as `saved: false` with no error, because the user
 * declining is an ordinary outcome and callers should not surface it as a failure.
 */

interface PickedFile {
  name: string;
  bytes: Uint8Array;
}

interface SaveFileRequest {
  /** Suggested file name, including extension. */
  name: string;
  bytes: Uint8Array;
  /** Extensions to offer in the dialog's filter, without leading dots. */
  extensions?: string[];
}

interface SaveFileResult {
  saved: boolean;
  /** Where it went, when the host can say. */
  name?: string;
  /** Set only for a real failure, never for a cancel. */
  error?: string;
}

interface FilePickerPort {
  pickFile: (opts?: { extensions?: string[] }) => Promise<PickedFile | null>;
  saveFile: (request: SaveFileRequest) => Promise<SaveFileResult>;
}

export type { PickedFile, SaveFileRequest, SaveFileResult, FilePickerPort };
