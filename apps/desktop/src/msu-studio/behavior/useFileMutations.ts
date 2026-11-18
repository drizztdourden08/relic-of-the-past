/* @layer renderer-components @kind hook */
import { useCallback } from 'react';
import { useT } from '@drizztdourden08/brock-react';
import { withFileRenamed } from '@rotp/msu';
import * as msuStore from '@app/storage/msu-store';
import { failure } from './failure';
import { renameProblem } from './rename-problem';
import type { FileMutationParams } from './file-panel.type';

const useFileMutations = (params: FileMutationParams) => {
  const { pack, saveBase, taken, reload, setStatus, setWorking } = params;
  const t = useT();

  const renameFile = useCallback((from: string, to: string) => {
    const wanted = to.trim();
    if (wanted === from) return;
    const problem = renameProblem(t, from, wanted, taken);
    if (problem !== null) { setStatus({ success: false, message: problem }); return; }
    setWorking(true);
    void (async () => {
      try {
        await msuStore.renameMsuTrackFile(pack, from, wanted);
        if (saveBase !== null) await msuStore.writeMsuManifest(pack, withFileRenamed(saveBase, from, wanted));
        setStatus({ success: true, message: t('msu-studio:status.renamed', { name: wanted }) });
      } catch (err) {
        setStatus(failure(err, t('msu-studio:files.error.rename')));
      } finally {
        setWorking(false);
        reload();
      }
    })();
  }, [t, pack, saveBase, taken, reload, setStatus, setWorking]);

  const deleteFile = useCallback((fileName: string) => {
    setWorking(true);
    void (async () => {
      try {
        await msuStore.deleteMsuTrackFile(pack, fileName);
        setStatus({ success: true, message: t('msu-studio:files.status.deleted', { name: fileName }) });
      } catch (err) {
        setStatus(failure(err, t('msu-studio:files.error.delete')));
      } finally {
        setWorking(false);
        reload();
      }
    })();
  }, [t, pack, reload, setStatus, setWorking]);

  return { renameFile, deleteFile };
};

export { useFileMutations };
