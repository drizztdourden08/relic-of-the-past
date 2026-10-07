/* @layer renderer-components @kind hook */
/**
 * The Hookshop tab's state, composed from one hook per concern: the account, the catalogue,
 * the installed record, install, uninstall, the selected item's detail and a link the browser
 * opened. Selecting an item from Home or the installed lists moves to Browse, where its
 * detail panel is.
 */
import { useCallback, useMemo, useState } from 'react';
import type { ItemCardView } from '@shared/store/home-types';
import type { StoreKind } from '@shared/store/types';
import type { StoreProps, StoreSection } from '../Store.type';
import { filterItems, installedRows, statusOf } from './catalog-filters';
import { useCatalog } from './useCatalog';
import { useInstall } from './useInstall';
import { useInstalled } from './useInstalled';
import { useItemDetail } from './useItemDetail';
import { useOpenInstall } from './useOpenInstall';
import { useStoreAccount } from './useStoreAccount';
import { useUninstall } from './useUninstall';

const GRID_SECTIONS: readonly StoreSection[] = ['browse', 'music', 'character', 'language'];

const kindOf = (section: StoreSection): StoreKind | null =>
  section === 'music' || section === 'character' || section === 'language' ? section : null;

const useStore = (props: StoreProps) => {
  const { onLibraryChanged, onDeleteConfirm } = props;
  const [section, setSection] = useState<StoreSection>('home');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const account = useStoreAccount();
  const catalog = useCatalog(account.signedIn, account.onSignedOut);
  const { packs, reload: reloadInstalled } = useInstalled();
  const libraryChanged = useCallback(() => {
    void reloadInstalled();
    void onLibraryChanged();
  }, [reloadInstalled, onLibraryChanged]);
  const installer = useInstall({ onInstalled: libraryChanged, onSignedOut: account.onSignedOut });
  const remover = useUninstall({ onDeleteConfirm, onUninstalled: libraryChanged });
  const { detail, detailError } = useItemDetail(selectedId, account.signedIn);

  const openItem = useCallback((itemId: string) => {
    setSelectedId(itemId);
    setSection((current) => (GRID_SECTIONS.includes(current) ? current : 'browse'));
  }, []);
  const { waitingLink } = useOpenInstall({ signedIn: account.signedIn, onOpen: openItem, install: installer.install });

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
    installer,
    remover,
    waitingLink,
  };
};

type StoreModel = ReturnType<typeof useStore>;

export { useStore };
export type { StoreModel };
