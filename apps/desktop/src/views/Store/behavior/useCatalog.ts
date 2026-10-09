/* @layer renderer-components @kind hook */
import { useCallback, useEffect, useState } from 'react';
import type { CatalogResult } from '@drizztdourden08/brock-catalog/renderer';
import { hookshopReads } from '@app/hookshop-reads';
import type { CatalogState } from '../Store.type';
import { EMPTY_CATALOG } from '../Store.constants';

const failureOf = <T>(result: CatalogResult<T>) => (result.ok ? null : result);

const useCatalog = (signedIn: boolean, onSignedOut: () => void) => {
  const [state, setState] = useState<CatalogState>(EMPTY_CATALOG);

  const reload = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }));
    const [home, items] = await Promise.all([hookshopReads.home(), hookshopReads.items()]);
    const failed = failureOf(home) ?? failureOf(items);
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
    else setState(EMPTY_CATALOG);
  }, [signedIn, reload]);

  return { ...state, reload };
};

export { useCatalog };
