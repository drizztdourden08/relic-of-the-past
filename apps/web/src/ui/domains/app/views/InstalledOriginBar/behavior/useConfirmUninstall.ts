/* @layer renderer-components @kind hook */
/**
 * An editor's Delete on an installed item: the same uninstall the Hookshop tab runs, asked with
 * the same words through the editor's confirm dialog, so the install record and the profiles
 * that use the item stay right. `onDone` runs once the uninstall went through.
 */
import { useCallback } from 'react';
import type { InstalledPack } from '@shared/store/installed-types';
import { useInstalledActions } from '@app/hooks/useInstalledActions';
import { uninstallMessage, uninstallTitle } from '../../../compounds/InstalledOrigin';

type ConfirmRequest = (title: string, message: string, onConfirm: () => void) => void;

const useConfirmUninstall = (onDeleteConfirm: ConfirmRequest) => {
  const { uninstall, error } = useInstalledActions();

  const confirmUninstall = useCallback((pack: InstalledPack, onDone: () => void) => {
    const { name } = pack.origin;
    onDeleteConfirm(uninstallTitle(name), uninstallMessage(name), () => {
      void uninstall(pack).then((done) => { if (done) onDone(); });
    });
  }, [onDeleteConfirm, uninstall]);

  return { confirmUninstall, uninstallError: error };
};

export { useConfirmUninstall };
