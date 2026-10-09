/* @layer sanctuary-site @kind types */
import type { SanctuaryFile } from '@shared/sanctuary/file-types';
import type { PatchFileBody } from '@shared/sanctuary/schemas/file-schemas';

type RightSplit = {
  mine: SanctuaryFile[];
  others: SanctuaryFile[];
};

type BatchTally = {
  changed: number;
  same: number;
  skipped: number;
  failed: number;
};

type PatchOf = (file: SanctuaryFile) => PatchFileBody | null;

export type { RightSplit, BatchTally, PatchOf };
