/* @layer renderer-components @kind hook */
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ItemCardView } from '@shared/store/home-types';
import { useInstalledPacks } from '@app/hooks/useInstalledPacks';
import type { StoreProps, StoreSection } from '../Store.type';
import { GRID_SECTIONS } from '../Store.constants';
import { filterItems } from './filter-items';
import { installedRows } from './installed-rows';
import { kindOf } from './kind-of';
import { statusOf } from './status-of';
import { useCatalog } from './useCatalog';
import { useItemDetail } from './useItemDetail';
import { useLibraryRefresh } from './useLibraryRefresh';
import { useLinkInstall } from './useLinkInstall';
import { useOpenInstall } from './useOpenInstall';
import { useStoreAccount } from './useStoreAccount';
import { useUninstall } from './useUninstall';

const useStore = (props: StoreProps) => {
  const { onLibraryChanged, onDeleteConfirm, section: requested } = props;
  const [section, setSection] = useState<StoreSection>(requested ?? 'home');
  useEffect(() => { if (requested) setSection(requested); }, [requested]);
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const account = useStoreAccount();
  const catalog = useCatalog(account.signedIn, account.onSignedOut);
  const packs = useInstalledPacks();
  const installLink = useLinkInstall(account.onSignedOut);
  useLibraryRefresh(onLibraryChanged);
  const { confirmUninstall } = useUninstall(onDeleteConfirm);
  const { detail, detailError } = useItemDetail(selectedId, account.signedIn);

  const openItem = useCallback((itemId: string) => {
    setSelectedId(itemId);
    setSection((current) => (GRID_SECTIONS.includes(current) ? current : 'browse'));
  }, []);
  const { waitingLink } = useOpenInstall({ signedIn: account.signedIn, onOpen: openItem, install: installLink });

  const rows = useMemo(() => installedRows(packs, catalog.items), [packs, catalog.items]);
  const updates = useMemo(() => rows.filter((row) => row.hasUpdate), [rows]);
  const visible = useMemo(() => filterItems(catalog.items, kindOf(section), query), [catalog.items, section, query]);
  const statusFor = useCallback((item: ItemCardView) => statusOf(packs, item), [packs]);

  return {
    section,
    setSection,
    query,
    setQuery,
    selectedId,
    openItem,
    account,
    catalog,
    rows,
    updates,
    visible,
    statusFor,
    selectedItem: catalog.items.find((item) => item.id === selectedId) ?? null,
    selectedPack: packs.find((pack) => pack.itemId === selectedId) ?? null,
    detail,
    detailError,
    confirmUninstall,
    waitingLink,
  };
};

export { useStore };
