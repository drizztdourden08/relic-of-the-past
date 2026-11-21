/* @layer renderer-components @kind hook */
import { useCallback } from 'react';
import { useT } from '@drizztdourden08/brock-react';
import type { InstalledPack } from '@rotp/hub-contracts';
import { useInstalledActions } from '@app/hooks/useInstalledActions';
import type { ConfirmRequest } from '../InstalledOriginBar.type';

const useConfirmUninstall = (onDeleteConfirm: ConfirmRequest) => {
  const t = useT();
  const { uninstall, error } = useInstalledActions();

  const confirmUninstall = useCallback((pack: InstalledPack, onDone: () => void) => {
    const { name } = pack.origin;
    onDeleteConfirm(t('compounds:installed-origin.uninstall-title', { name }), t('compounds:installed-origin.uninstall-message', { name }), () => {
      void uninstall(pack).then((done) => { if (done) onDone(); });
    });
  }, [onDeleteConfirm, t, uninstall]);

  return { confirmUninstall, uninstallError: error };
};

export { useConfirmUninstall };
