/* @layer renderer-components @kind component */
/** The detail column: nothing selected, the item loading or failing, or the item itself. */
import { useCallback } from 'react';
import { Spinner, Text } from '@ds/primitives';
import { storeItemUrl } from '@app/lib/store/store-site';
import type { StoreModel } from '../behavior/useStore';
import { StoreDetail } from './StoreDetail';

interface StoreDetailPanelProps {
  store: StoreModel;
}

const StoreDetailPanel = (props: StoreDetailPanelProps) => {
  const { store } = props;
  const { selectedId, detail, detailError, selectedPack, installer, remover } = store;
  const itemId = selectedId ?? '';
  const name = detail?.item.name ?? selectedPack?.installedName ?? itemId;

  const handleInstall = useCallback(() => { void installer.install(itemId); }, [installer, itemId]);
  const handleCancel = useCallback(() => installer.cancel(itemId), [installer, itemId]);
  const handleUninstall = useCallback(() => remover.uninstall(itemId, name), [remover, itemId, name]);
  // window.open on an external URL is routed to the system browser by the main process.
  const handleOpenSite = useCallback(() => { window.open(storeItemUrl(itemId), '_blank'); }, [itemId]);

  if (!selectedId) return <Text>Select a pack to see it here</Text>;
  if (detailError) return <Text as="p" className="store__error">{detailError}</Text>;
  if (!detail) return <Spinner size="sm" />;

  return (
    <>
      <StoreDetail
        detail={detail}
        pack={selectedPack}
        job={installer.jobOf(itemId)}
        uninstalling={remover.uninstallingId === itemId}
        onInstall={handleInstall}
        onCancel={handleCancel}
        onUninstall={handleUninstall}
        onOpenSite={handleOpenSite}
      />
      {remover.uninstallError && <Text as="p" className="store__error">{remover.uninstallError}</Text>}
    </>
  );
};

export { StoreDetailPanel };
