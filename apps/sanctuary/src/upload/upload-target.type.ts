/* @layer sanctuary-site @kind types */
import type { FileType } from '@shared/sanctuary/file-types';

/** What the upload dialog asks before the first byte moves; shared by every file of one drop. */
type UploadMeta = {
  type: FileType;
  tags: string[];
  version: string | null;
  note: string;
};

/** Where an upload lands: a new file, or the next version of one that exists. */
type UploadTarget =
  | { kind: 'new'; meta: UploadMeta }
  | {
    kind: 'version';
    fileId: string;
    /** What changed, one line. */
    note: string;
    /** The file's display name, for the upload row. */
    of: string;
    /** The number the site expects; the API's answer replaces it. */
    next: number;
  };

export type { UploadMeta, UploadTarget };
