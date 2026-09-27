/* @layer site-kit @kind types */
/** What one run of an upload is told and reports while it goes. */
type RunUploadParams<T> = {
  file: File;
  target: T;
  sha256: string | null;
  /** Called once the API has created the record, with the version number it gave. */
  onBegun: (recordId: string, n: number | null) => void;
  /** Total bytes sent so far, across every part. */
  onProgress: (sent: number) => void;
};

/**
 * How a site uploads: the size cap, the row label, which of the dropped files a target
 * takes, and the run itself (begin on the site's route, then the shared multipart loop).
 * The upload list is the same for every site; only this changes.
 */
type UploadRunner<T, R> = {
  maxBytes: number;
  labelOf: (file: File, target: T, n?: number | null) => string;
  pick: (files: File[], target: T) => File[];
  run: (params: RunUploadParams<T>) => Promise<R>;
  recordIdOf: (record: R) => string;
};

export type { RunUploadParams, UploadRunner };
