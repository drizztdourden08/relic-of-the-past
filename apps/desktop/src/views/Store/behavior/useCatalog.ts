/* @layer renderer-components @kind hook */
import { useEffect } from 'react';
import { useHookshopCatalogStore } from '@app/stores/hookshop-catalog';

const useCatalog = (signedIn: boolean, onSignedOut: () => void) => {
  const home = useHookshopCatalogStore((s) => s.home);
  const items = useHookshopCatalogStore((s) => s.items);
  const loading = useHookshopCatalogStore((s) => s.loading);
  const error = useHookshopCatalogStore((s) => s.error);

  useEffect(() => {
    const store = useHookshopCatalogStore.getState();
    if (!signedIn) {
      if (store.loaded || store.loading) store.clear();
      return;
    }
    if (!store.loaded && !store.loading) void store.load(onSignedOut);
  }, [signedIn, onSignedOut]);

  return { home, items, loading, error };
};

export { useCatalog };
