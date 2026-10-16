/* @layer renderer-stores @kind logic */
import { create } from 'zustand';
import type { CatalogResult } from '@drizztdourden08/brock-catalog/renderer';
import { hookshopReads } from '@app/hookshop-reads';
import { EMPTY_CATALOG } from './hookshop-catalog.constants';
import type { HookshopCatalogStore } from './hookshop-catalog.type';

const failureOf = <T>(result: CatalogResult<T>) => (result.ok ? null : result);

const useHookshopCatalogStore = create<HookshopCatalogStore>((set, get) => ({
  ...EMPTY_CATALOG,
  loaded: false,
  generation: 0,

  load: async (onSignedOut) => {
    const { generation } = get();
    set({ loading: true, error: null });
    const [home, items] = await Promise.all([hookshopReads.home(), hookshopReads.items()]);
    if (get().generation !== generation) return;
    const failed = failureOf(home) ?? failureOf(items);
    if (failed?.signedOut) onSignedOut();
    set({
      home: home.ok ? home.data : null,
      items: items.ok ? items.data : [],
      loading: false,
      error: failed ? failed.error : null,
      loaded: true,
    });
  },

  clear: () => set({ ...EMPTY_CATALOG, loaded: false, generation: get().generation + 1 }),
}));

export { useHookshopCatalogStore };
