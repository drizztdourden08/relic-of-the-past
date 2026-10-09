/* @layer renderer-components @kind hook */
import { useEffect } from 'react';
import { useInstalledStore } from '@app/stores/installed-store';

const useInstalled = () => {
  const packs = useInstalledStore((state) => state.packs);
  const reload = useInstalledStore((state) => state.reload);
  const watch = useInstalledStore((state) => state.watch);

  useEffect(() => {
    watch();
    void reload();
  }, [watch, reload]);

  return { packs, reload };
};

export { useInstalled };
