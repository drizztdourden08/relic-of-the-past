/* @layer renderer-components @kind hook */
/** What the Hookshop installed on this computer, read from the main process's record. */
import { useCallback, useEffect, useState } from 'react';
import type { InstalledPack } from '@shared/store/installed-types';

const useInstalled = () => {
  const [packs, setPacks] = useState<InstalledPack[]>([]);

  // Off Electron there is no record to read, so the list stays empty.
  const reload = useCallback(async () => {
    setPacks((await window.api.storeInstalled?.()) ?? []);
  }, []);

  useEffect(() => { void reload(); }, [reload]);

  return { packs, reload };
};

export { useInstalled };
