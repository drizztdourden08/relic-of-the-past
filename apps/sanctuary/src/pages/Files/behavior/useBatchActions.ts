/* @layer sanctuary-site @kind hook */
/**
 * What the selection panel can do to several files at once, besides downloading them:
 * copy their links, set their type, add or remove tags, delete them. A write goes to
 * each file the caller may change, one after another, and skips the rest; `notice`
 * then says how many were changed, skipped or failed.
 */
import { useCallback, useState } from 'react';
import type { FileType, SanctuaryFile } from '@shared/sanctuary/file-types';
import { deleteFile, patchFile } from '../../../api/files-endpoints';
import { errorMessage } from '../../../api/client';
import { fileLink } from './useFileActions';
import {
  EMPTY_TALLY, addTagsPatch, batchReport, removeTagsPatch, splitByRight, typePatch,
} from './batch-edits';
import type { BatchTally, PatchOf } from './batch-edits';

type UseBatchActionsParams = {
  canEdit: (file: SanctuaryFile) => boolean;
  onPatched: (file: SanctuaryFile) => void;
  onDeleted: (id: string) => void;
};

type FileWrite = (file: SanctuaryFile) => Promise<'changed' | 'same'>;

const useBatchActions = (params: UseBatchActionsParams) => {
  const { canEdit, onPatched, onDeleted } = params;
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const run = useCallback(async (work: () => Promise<string>) => {
    setBusy(true);
    setNotice(null);
    try {
      setNotice(await work());
    } catch (cause) {
      setNotice(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }, []);

  /** One write per file the caller may change, in order; a failure is counted, never thrown. */
  const eachMine = useCallback(async (files: readonly SanctuaryFile[], write: FileWrite): Promise<BatchTally> => {
    const { mine, others } = splitByRight(files, canEdit);
    const tally = { ...EMPTY_TALLY, skipped: others.length };
    for (const file of mine) {
      try {
        tally[await write(file)] += 1;
      } catch {
        tally.failed += 1;
      }
    }
    return tally;
  }, [canEdit]);

  const patchEach = useCallback((files: readonly SanctuaryFile[], patchOf: PatchOf) => run(async () => {
    const tally = await eachMine(files, async (file) => {
      const body = patchOf(file);
      if (!body) return 'same';
      onPatched((await patchFile(file.id, body)).file);
      return 'changed';
    });
    return batchReport(tally, 'changed');
  }), [run, eachMine, onPatched]);

  const setType = useCallback(
    (files: readonly SanctuaryFile[], type: FileType) => patchEach(files, typePatch(type)),
    [patchEach],
  );
  const addTags = useCallback(
    (files: readonly SanctuaryFile[], tags: readonly string[]) => patchEach(files, addTagsPatch(tags)),
    [patchEach],
  );
  const removeTags = useCallback(
    (files: readonly SanctuaryFile[], tags: readonly string[]) => patchEach(files, removeTagsPatch(tags)),
    [patchEach],
  );

  const remove = useCallback((files: readonly SanctuaryFile[]) => run(async () => {
    const tally = await eachMine(files, async (file) => {
      await deleteFile(file.id);
      onDeleted(file.id);
      return 'changed';
    });
    return batchReport(tally, 'deleted');
  }), [run, eachMine, onDeleted]);

  const copyLinks = useCallback((files: readonly SanctuaryFile[]) => run(async () => {
    await navigator.clipboard.writeText(files.map((file) => fileLink(file.id)).join('\n'));
    return files.length === 1 ? '1 link copied.' : `${files.length} links copied.`;
  }), [run]);

  /** A report belongs to the pick it was made on; a new pick drops it. */
  const dismiss = useCallback(() => setNotice(null), []);

  return { busy, notice, dismiss, setType, addTags, removeTags, remove, copyLinks };
};

type BatchActions = ReturnType<typeof useBatchActions>;

export { useBatchActions };
export type { BatchActions, UseBatchActionsParams };
