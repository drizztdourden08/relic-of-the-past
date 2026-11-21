/* @layer renderer-components @kind hook */
import { useCallback } from 'react';
import { useT } from '@drizztdourden08/brock-react';
import type { ConfirmUninstall, DeleteConfirm } from '../Store.type';

const useUninstall = (onDeleteConfirm: DeleteConfirm) => {
  const t = useT();
  const confirmUninstall: ConfirmUninstall = useCallback((name, run) => {
    onDeleteConfirm(t('compounds:installed-origin.uninstall-title', { name }), t('compounds:installed-origin.uninstall-message', { name }), () => { void run(); });
  }, [onDeleteConfirm, t]);

  return { confirmUninstall };
};

export { useUninstall };
