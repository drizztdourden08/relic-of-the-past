/* @layer store-site @kind hook */
import { useEffect, useMemo, useState } from 'react';
import type { HomeView, ItemCardView } from '@rotp/hub-contracts';
import type { StoreKind } from '@rotp/hub-contracts';
import { errorMessage } from '@rotp/hub-client';
import { getHome } from '../../../api/catalog-endpoints';
import { useStoreData } from '../../../data/store-data-context';
import { STORE_KINDS } from '../../../lib/kinds';
import { KIND_SHELF_SIZE } from './useHome.constants';

const byInstalls = (a: ItemCardView, b: ItemCardView) => b.installs30d - a.installs30d;

const useHome = () => {
  const { catalog } = useStoreData();
  const [home, setHome] = useState<HomeView | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    getHome().then(
      (view) => { if (live) setHome(view); },
      (cause: unknown) => { if (live) setError(errorMessage(cause)); },
    );
    return () => { live = false; };
  }, []);

  const kindShelves = useMemo(
    () => STORE_KINDS.map((kind): { kind: StoreKind; items: ItemCardView[] } => ({
      kind,
      items: catalog.items.filter((item) => item.kind === kind).sort(byInstalls).slice(0, KIND_SHELF_SIZE),
    })),
    [catalog.items],
  );

  return { home, loading: home === null && error === null, error, kindShelves };
};

export { useHome };
