/* @layer renderer-components @kind component */
/**
 * The origin bar, wired: the install record, the store's live version, and Duplicate, Update,
 * Open on the site and Uninstall run through the store IPC. Every editor that shows an
 * installed item puts this at its top and is told what to select after each action.
 */
import { useCallback } from 'react';
import { copyRefusal } from '@shared/store/licenses';
import { storeItemUrl } from '@app/lib/store/store-site';
import { useInstalledActions } from '@app/hooks/useInstalledActions';
import { InstalledOrigin } from '../../compounds/InstalledOrigin';
import { useUpdateTo } from './behavior/useUpdateTo';
import type { InstalledOriginBarProps } from './InstalledOriginBar.type';

const InstalledOriginBar = (props: InstalledOriginBarProps) => {
  const { pack, onDuplicated, onUpdated, onUninstalled } = props;
  const { busy, error, uninstall, duplicate, update } = useInstalledActions();
  const updateTo = useUpdateTo(pack);

  const handleDuplicate = useCallback(() => {
    void duplicate(pack).then((name) => { if (name !== null) onDuplicated(name); });
  }, [duplicate, pack, onDuplicated]);

  const handleUpdate = useCallback(() => {
    void update(pack).then((name) => { if (name !== null) onUpdated(name); });
  }, [update, pack, onUpdated]);

  const handleUninstall = useCallback(() => {
    void uninstall(pack).then((done) => { if (done) onUninstalled(); });
  }, [uninstall, pack, onUninstalled]);

  const handleOpenOnSite = useCallback(() => {
    window.open(storeItemUrl(pack.itemId), '_blank');
  }, [pack.itemId]);

  return (
    <InstalledOrigin
      origin={pack.origin}
      semver={pack.semver}
      updateTo={updateTo}
      copyRefusal={copyRefusal(pack.origin.license)}
      busy={busy}
      error={error}
      onDuplicate={handleDuplicate}
      onUpdate={handleUpdate}
      onOpenOnSite={handleOpenOnSite}
      onUninstall={handleUninstall}
    />
  );
};

export { InstalledOriginBar };
