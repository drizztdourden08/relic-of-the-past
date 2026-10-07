/* @layer renderer-components @kind hook */
/**
 * The store's live version of an installed item when it differs from the installed one, or
 * null. Asked of the store once per item and installed version; signed out, the store does not
 * answer, so no update is offered.
 */
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
