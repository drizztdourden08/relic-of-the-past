/* @layer renderer-components @kind hook */
/**
 * The home page and the whole catalogue, loaded together once signed in. A refused token
 * reports signed out so the account refreshes and the tab shows the sign-in card.
 */
import { useCallback, useEffect, useState } from 'react';
import type { HomeResponse } from '@shared/store/api-types';
import type { ItemCardView } from '@shared/store/home-types';

interface CatalogState {
  home: HomeResponse | null;
  items: ItemCardView[];
  loading: boolean;
  error: string | null;
}

const EMPTY: CatalogState = { home: null, items: [], loading: false, error: null };

const useCatalog = (signedIn: boolean, onSignedOut: () => void) => {
  const [state, setState] = useState<CatalogState>(EMPTY);

  const reload = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }));
    const [home, items] = await Promise.all([window.api.storeHome(), window.api.storeItems(null)]);
    const failed = !home.ok ? home : !items.ok ? items : null;
    if (failed?.signedOut) onSignedOut();
    setState({
      home: home.ok ? home.data : null,
      items: items.ok ? items.data : [],
      loading: false,
      error: failed ? failed.error : null,
    });
  }, [onSignedOut]);

  useEffect(() => {
    if (signedIn) void reload();
    else setState(EMPTY);
  }, [signedIn, reload]);

  return { ...state, reload };
};

export { useCatalog };
