/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { copyRefusal } from '@rotp/hub-contracts';
import { storeItemUrl } from '@rotp/hub-client';
import { useInstalledActions } from '@app/hooks/useInstalledActions';
import { InstalledOrigin } from '../../compounds/InstalledOrigin';
import { useUpdateTo } from './behavior/useUpdateTo';
import type { InstalledOriginBarProps } from './InstalledOriginBar.type';

const InstalledOriginBar = (props: InstalledOriginBarProps) => {
  const { pack, onDuplicated, onUpdateInstalled, onUninstalled } = props;
  const { busy, error, uninstall, duplicate, update } = useInstalledActions();
  const updateTo = useUpdateTo(pack);

  const handleDuplicate = useCallback(() => {
    void duplicate(pack).then((name) => { if (name !== null) onDuplicated(name); });
  }, [duplicate, pack, onDuplicated]);

  const handleUpdate = useCallback(() => {
    void update(pack).then((name) => { if (name !== null) onUpdateInstalled(name); });
  }, [update, pack, onUpdateInstalled]);

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
