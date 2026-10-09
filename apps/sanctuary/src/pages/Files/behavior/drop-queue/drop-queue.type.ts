/* @layer sanctuary-site @kind types */
import type { SanctuaryFile } from '@shared/sanctuary/file-types';

type VersionRequest = { file: SanctuaryFile; dropped: File };

type SameNameQuestion = { dropped: File; match: SanctuaryFile };

type DropQueue = {
  queue: File[];
  batch: File[];
  asking: SameNameQuestion | null;
  version: VersionRequest | null;
  upload: File[];
};

type MatchOf = (dropped: File) => SanctuaryFile | null;

export type { DropQueue, VersionRequest, SameNameQuestion, MatchOf };
