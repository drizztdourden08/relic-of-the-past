/* @layer renderer-components @kind hook */
import { useCallback } from 'react';
import type { InstalledPack } from '@rotp/hub-contracts';
import { useInstalledActions } from '@app/hooks/useInstalledActions';
import { uninstallMessage, uninstallTitle } from '../../../compounds/InstalledOrigin';
import type { ConfirmRequest } from '../InstalledOriginBar.type';

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
