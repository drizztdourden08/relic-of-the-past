/* @layer shared-platform @kind logic */
/**
 * File-picker port: open the OS file chooser and return the chosen file's bytes.
 * Electron uses its native dialog; Capacitor a picker plugin; web an <input>.
 */

interface PickedFile {
  name: string;
  bytes: Uint8Array;
}

interface FilePickerPort {
  pickFile: (opts?: { extensions?: string[] }) => Promise<PickedFile | null>;
}

export type { PickedFile, FilePickerPort };
