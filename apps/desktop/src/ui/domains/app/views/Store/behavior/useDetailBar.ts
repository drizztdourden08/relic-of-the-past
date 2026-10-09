/* @layer renderer-components @kind hook */
import type { CatalogInstallBarProps } from '@drizztdourden08/brock-catalog/renderer';
import type { StoreModel } from '../Store.type';
import { liveUpdate } from './live-update';
import { useInstallBar } from './useInstallBar';

const useDetailBar = (store: StoreModel): CatalogInstallBarProps => {
  const { selectedId, detail, selectedPack, account, confirmUninstall } = store;
  const itemId = selectedId ?? '';
  const name = detail?.item.name ?? selectedPack?.installedName ?? itemId;
  const hasUpdate = liveUpdate(selectedPack, detail);
  return useInstallBar({ itemId, name, hasUpdate, onSignedOut: account.onSignedOut, onConfirmUninstall: confirmUninstall });
};

export { useDetailBar };
