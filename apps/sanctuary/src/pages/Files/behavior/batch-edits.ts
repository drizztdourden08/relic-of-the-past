/* @layer sanctuary-site @kind logic */
/**
 * The pieces a batch action on picked files is made of: which files the caller may
 * change and which are skipped, the patch one file needs (null when it already has the
 * value), and the one line that reports how it went.
 */
import type { FileType, SanctuaryFile } from '@shared/sanctuary/file-types';
import type { PatchFileBody } from '@shared/sanctuary/schemas/file-schemas';

type RightSplit = {
  /** Files the caller may change: their own, or any file for an admin. */
  mine: SanctuaryFile[];
  /** Files a write would be refused on; a batch leaves them out. */
  others: SanctuaryFile[];
};

type BatchTally = {
  changed: number;
  /** Already had the value; nothing was sent. */
  same: number;
  skipped: number;
  failed: number;
};

type PatchOf = (file: SanctuaryFile) => PatchFileBody | null;

const splitByRight = (files: readonly SanctuaryFile[], canEdit: (file: SanctuaryFile) => boolean): RightSplit => ({
  mine: files.filter(canEdit),
  others: files.filter((file) => !canEdit(file)),
});

const typePatch = (type: FileType): PatchOf => (file) => (file.type === type ? null : { type });

const addTagsPatch = (tags: readonly string[]): PatchOf => (file) => {
  const added = tags.filter((tag) => !file.tags.includes(tag));
  return added.length === 0 ? null : { tags: [...file.tags, ...added] };
};

const removeTagsPatch = (tags: readonly string[]): PatchOf => (file) => {
  const kept = file.tags.filter((tag) => !tags.includes(tag));
  return kept.length === file.tags.length ? null : { tags: kept };
};

const EMPTY_TALLY: BatchTally = { changed: 0, same: 0, skipped: 0, failed: 0 };

/** "3 changed, 1 already set, 2 skipped (not yours)." with the zero counts left out. */
const batchReport = (tally: BatchTally, verb: string): string => {
  const parts = [
    `${tally.changed} ${verb}`,
    tally.same > 0 && `${tally.same} already set`,
    tally.skipped > 0 && `${tally.skipped} skipped (not yours)`,
    tally.failed > 0 && `${tally.failed} failed`,
  ].filter(Boolean);
  return `${parts.join(', ')}.`;
};

export { splitByRight, typePatch, addTagsPatch, removeTagsPatch, batchReport, EMPTY_TALLY };
export type { RightSplit, BatchTally, PatchOf };
