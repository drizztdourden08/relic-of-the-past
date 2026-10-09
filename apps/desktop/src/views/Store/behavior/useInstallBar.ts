/* @layer renderer-components @kind hook */
import { useCallback, useEffect } from 'react';
import { installBarProps, useCatalogItem } from '@drizztdourden08/brock-catalog/renderer';
import type { CatalogInstallBarProps } from '@drizztdourden08/brock-catalog/renderer';
import type { InstallBarParams } from '../Store.type';

const useInstallBar = (params: InstallBarParams): CatalogInstallBarProps => {
  const { itemId, name, hasUpdate, onSignedOut, onConfirmUninstall } = params;
  const item = useCatalogItem(itemId);
  const { signedOut, uninstall } = item;

  useEffect(() => { if (signedOut) onSignedOut(); }, [signedOut, onSignedOut]);

  const handleUninstall = useCallback(() => onConfirmUninstall(name, uninstall), [onConfirmUninstall, name, uninstall]);

  return { ...installBarProps(item), hasUpdate, onUninstall: handleUninstall };
};

export { useInstallBar };
