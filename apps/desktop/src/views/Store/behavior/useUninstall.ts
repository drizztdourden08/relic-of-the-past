/* @layer renderer-components @kind hook */
import { useCallback } from 'react';
import { uninstallMessage, uninstallTitle } from '../../../compounds/InstalledOrigin';
import type { ConfirmUninstall, DeleteConfirm } from '../Store.type';

const useUninstall = (onDeleteConfirm: DeleteConfirm) => {
  const confirmUninstall: ConfirmUninstall = useCallback((name, run) => {
    onDeleteConfirm(uninstallTitle(name), uninstallMessage(name), () => { void run(); });
  }, [onDeleteConfirm]);

  return { confirmUninstall };
};

export { useUninstall };
