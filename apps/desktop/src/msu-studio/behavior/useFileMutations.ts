/* @layer renderer-components @kind hook */
import { useCallback } from 'react';
import { withFileRenamed } from '@rotp/msu';
import * as msuStore from '@app/storage/msu-store';
import { failure } from './failure';
import { renameProblem } from './rename-problem';
import type { FileMutationParams } from './file-panel.type';

const useFileMutations = (params: FileMutationParams) => {
  const { pack, saveBase, taken, reload, setStatus, setWorking } = params;

  const renameFile = useCallback((from: string, to: string) => {
    const wanted = to.trim();
    if (wanted === from) return;
    const problem = renameProblem(from, wanted, taken);
    if (problem !== null) { setStatus({ success: false, message: problem }); return; }
    setWorking(true);
    void (async () => {
      try {
        await msuStore.renameMsuTrackFile(pack, from, wanted);
        if (saveBase !== null) await msuStore.writeMsuManifest(pack, withFileRenamed(saveBase, from, wanted));
        setStatus({ success: true, message: `Renamed to "${wanted}"` });
      } catch (err) {
        setStatus(failure(err, 'Could not rename that file'));
      } finally {
        setWorking(false);
        reload();
      }
    })();
  }, [pack, saveBase, taken, reload, setStatus, setWorking]);

  const deleteFile = useCallback((fileName: string) => {
    setWorking(true);
    void (async () => {
      try {
        await msuStore.deleteMsuTrackFile(pack, fileName);
        setStatus({ success: true, message: `Deleted "${fileName}"` });
      } catch (err) {
        setStatus(failure(err, 'Could not delete that file'));
      } finally {
        setWorking(false);
        reload();
      }
    })();
  }, [pack, reload, setStatus, setWorking]);

  return { renameFile, deleteFile };
};

export { useFileMutations };
