/* @layer renderer-components @kind hook */
import { useEffect, useState } from 'react';
import type { InstalledPack } from '@shared/store/installed-types';
import { liveVersionOf } from '../../Store/behavior/item-facts';

const useUpdateTo = (pack: InstalledPack): string | null => {
  const { itemId, semver } = pack;
  const [live, setLive] = useState<string | null>(null);

  useEffect(() => {
    setLive(null);
    let current = true;
    void window.api.storeItem(itemId).then((result) => {
      if (current && result.ok) setLive(liveVersionOf(result.data.item)?.semver ?? null);
    });
    return () => { current = false; };
  }, [itemId, semver]);

  return live !== null && live !== semver ? live : null;
};

export { useUpdateTo };
