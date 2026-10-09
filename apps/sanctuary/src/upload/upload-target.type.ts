/* @layer sanctuary-site @kind types */
import type { FileType } from '@shared/sanctuary/file-types';

type UploadMeta = {
  type: FileType;
  tags: string[];
  version: string | null;
  note: string;
};

type UploadTarget =
  | { kind: 'new'; meta: UploadMeta }
  | {
    kind: 'version';
    fileId: string;
    note: string;
    of: string;
    next: number;
  };

export type { UploadMeta, UploadTarget };
