/* @layer renderer-components @kind hook */
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ItemCardView } from '@rotp/hub-contracts';
import { useGameSession } from '@app/hooks/useGameSession';
import { useInstalledPacks } from '@app/hooks/useInstalledPacks';
import type { StoreParams } from '../Store.type';
import { filterItems } from './filter-items';
import { installedRows } from './installed-rows';
import { statusOf } from './status-of';
import { useCatalog } from './useCatalog';
import { useItemDetail } from './useItemDetail';
import { useLibraryRefresh } from './useLibraryRefresh';
import { useStoreAccount } from './useStoreAccount';
import { useUninstall } from './useUninstall';

const useStore = (params: StoreParams) => {
  const { kind, item } = params;
  const { profileMgmt, dialogs } = useGameSession();
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(item ?? null);
  useEffect(() => { if (item) setSelectedId(item); }, [item]);

  const account = useStoreAccount();
  const catalog = useCatalog(account.signedIn, account.onSignedOut);
  const packs = useInstalledPacks();
  useLibraryRefresh(profileMgmt.refreshProfilesAndRoms);
  const { confirmUninstall } = useUninstall(dialogs.handleDeleteConfirm);
  const { detail, detailError } = useItemDetail(selectedId, account.signedIn);

  const rows = useMemo(() => installedRows(packs, catalog.items), [packs, catalog.items]);
  const updates = useMemo(() => rows.filter((row) => row.hasUpdate), [rows]);
  const visible = useMemo(() => filterItems(catalog.items, kind, query), [catalog.items, kind, query]);
  const statusFor = useCallback((card: ItemCardView) => statusOf(packs, card), [packs]);

  return {
    query,
    setQuery,
    selectedId,
    select: setSelectedId,
    account,
    catalog,
    rows,
    updates,
    visible,
    statusFor,
    selectedPack: packs.find((pack) => pack.itemId === selectedId) ?? null,
    detail,
    detailError,
    confirmUninstall,
  };
};

export { useStore };
