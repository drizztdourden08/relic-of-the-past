/* @layer renderer-components @kind types */
import type { InstallProgress } from '@shared/store/install/installer.type';
import type { InstalledPack } from '@shared/store/installed-types';
import type { HomeResponse, ItemResponse } from '@shared/store/api-types';
import type { ItemCardView } from '@shared/store/home-types';
import type { StoreOpenInstall } from '@shared/ipc';
import type { StoreItemStatus } from '../../compounds/StoreItemCard';
import type { useInstall } from './behavior/useInstall';
import type { useStore } from './behavior/useStore';
import type { useStoreAccount } from './behavior/useStoreAccount';

type StoreSection = 'home' | 'browse' | 'music' | 'character' | 'language' | 'installed' | 'updates';

interface StoreProps {
  onLibraryChanged: () => unknown;
  onDeleteConfirm: (title: string, message: string, onConfirm: () => void) => void;
  section?: StoreSection;
}

interface InstallJob {
  running: boolean;
  progress: InstallProgress | null;
  error: string | null;
}

interface InstalledRow {
  pack: InstalledPack;
  item: ItemCardView | null;
  hasUpdate: boolean;
}

interface CatalogState {
  home: HomeResponse | null;
  items: ItemCardView[];
  loading: boolean;
  error: string | null;
}

type InstallParams = {
  onInstalled: () => void;
  onSignedOut: () => void;
};

type OpenInstallParams = {
  signedIn: boolean;
  onOpen: (itemId: string) => void;
  install: (itemId: string, version: number | null) => void;
};

type UninstallParams = {
  onDeleteConfirm: (title: string, message: string, onConfirm: () => void) => void;
  onUninstalled: () => void;
};

type StoreInstaller = ReturnType<typeof useInstall>;

type StoreModel = ReturnType<typeof useStore>;

type StoreAccount = ReturnType<typeof useStoreAccount>;

interface StoreBrowseProps {
  title: string;
  store: StoreModel;
}

interface StoreDetailProps {
  detail: ItemResponse;
  pack: InstalledPack | null;
  job: InstallJob;
  uninstalling: boolean;
  onInstall: () => void;
  onCancel: () => void;
  onUninstall: () => void;
  onOpenSite: () => void;
}

interface StoreDetailPanelProps {
  store: StoreModel;
}

interface StoreGridProps {
  items: ItemCardView[];
  statusFor: (item: ItemCardView) => StoreItemStatus;
  selectedId: string | null;
  onSelect: (itemId: string) => void;
}

interface StoreHomeProps {
  name: string;
  home: HomeResponse | null;
  loading: boolean;
  error: string | null;
  updateCount: number;
  statusFor: (item: ItemCardView) => StoreItemStatus;
  onSelect: (itemId: string) => void;
  onShowUpdates: () => void;
}

interface StoreInstallBarProps {
  job: InstallJob;
  onCancel: () => void;
}

interface StoreInstalledListProps {
  title: string;
  rows: InstalledRow[];
  emptyText: string;
  store: StoreModel;
}

interface StoreInstalledRowProps {
  row: InstalledRow;
  job: InstallJob;
  canUpdate: boolean;
  uninstalling: boolean;
  onUpdate: (itemId: string) => void;
  onCancel: (itemId: string) => void;
  onUninstall: (itemId: string, name: string) => void;
}

interface StoreSectionContentProps {
  store: StoreModel;
}

interface StoreSignInProps {
  account: StoreAccount;
  waitingLink: StoreOpenInstall | null;
}

export type {
  CatalogState,
  InstallJob,
  InstallParams,
  InstalledRow,
  OpenInstallParams,
  StoreAccount,
  StoreBrowseProps,
  StoreDetailPanelProps,
  StoreDetailProps,
  StoreGridProps,
  StoreHomeProps,
  StoreInstallBarProps,
  StoreInstalledListProps,
  StoreInstalledRowProps,
  StoreInstaller,
  StoreModel,
  StoreProps,
  StoreSection,
  StoreSectionContentProps,
  StoreSignInProps,
  UninstallParams,
};
