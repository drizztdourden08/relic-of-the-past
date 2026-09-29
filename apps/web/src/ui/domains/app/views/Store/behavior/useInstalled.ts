/* @layer renderer-components @kind hook */
/**
 * What the Hookshop installed on this computer, from the installed store the editors lock
 * against, so an install or uninstall here shows in every editor at once.
 */
import { useEffect } from 'react';
import { useInstalledStore } from '@app/stores/installed-store';

const useInstalled = () => {
  const packs = useInstalledStore((state) => state.packs);
  const reload = useInstalledStore((state) => state.reload);
  const watch = useInstalledStore((state) => state.watch);

  // The tab reads the record fresh each time it opens; the watch keeps it current after that.
  useEffect(() => {
    watch();
    void reload();
  }, [watch, reload]);

  return { packs, reload };
};

export { useInstalled };
