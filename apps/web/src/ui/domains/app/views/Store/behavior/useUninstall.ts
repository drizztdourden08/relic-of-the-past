/* @layer renderer-components @kind hook */
/**
 * Uninstalling, after the shell's confirm dialog. The main process sets any profile that
 * used the pack back to the default before it removes the files, so the shell's lists are
 * refreshed afterwards.
 */
import { useCallback, useState } from 'react';

type UninstallParams = {
  onDeleteConfirm: (title: string, message: string, onConfirm: () => void) => void;
  onUninstalled: () => void;
};

const useUninstall = (params: UninstallParams) => {
  const { onDeleteConfirm, onUninstalled } = params;
  const [uninstallingId, setUninstallingId] = useState<string | null>(null);
  const [uninstallError, setUninstallError] = useState<string | null>(null);

  const run = useCallback(async (itemId: string) => {
    setUninstallingId(itemId);
    setUninstallError(null);
    const result = await window.api.storeUninstall(itemId);
    setUninstallingId(null);
    if (!result.ok) setUninstallError(result.error);
    onUninstalled();
  }, [onUninstalled]);

  const uninstall = useCallback((itemId: string, name: string) => {
    onDeleteConfirm(
      `Uninstall ${name}`,
      `Remove ${name} from this computer? A profile that uses it goes back to the default.`,
      () => { void run(itemId); },
    );
  }, [onDeleteConfirm, run]);

  return { uninstall, uninstallingId, uninstallError };
};

export { useUninstall };
