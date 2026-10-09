/* @layer sanctuary-site @kind types */
import type { SanctuaryFile } from '@rotp/hub-contracts';
import type { PatchFileBody } from '@rotp/hub-contracts';

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
