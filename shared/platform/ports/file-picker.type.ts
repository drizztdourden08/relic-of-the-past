/* @layer shared-platform @kind types */
interface PickedFile {
  name: string;
  bytes: Uint8Array;
}

interface SaveFileRequest {
  name: string;
  bytes: Uint8Array;
  extensions?: string[];
}

interface SaveFileResult {
  saved: boolean;
  name?: string;
  error?: string;
}

interface FilePickerPort {
  pickFile: (opts?: { extensions?: string[] }) => Promise<PickedFile | null>;
  saveFile: (request: SaveFileRequest) => Promise<SaveFileResult>;
}

export type { PickedFile, SaveFileRequest, SaveFileResult, FilePickerPort };
