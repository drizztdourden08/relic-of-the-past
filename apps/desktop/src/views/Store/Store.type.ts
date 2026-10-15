/* @layer renderer-components @kind types */
import type { CatalogInstallBarProps, CatalogLink } from '@drizztdourden08/brock-catalog/renderer';
import type { InstalledPack, HomeResponse, ItemResponse, ItemCardView } from '@rotp/hub-contracts';
import type { StoreItemStatus } from '../../compounds/StoreItemCard';
import type { useStore } from './behavior/useStore';
import type { useStoreAccount } from './behavior/useStoreAccount';

type StoreSection = 'home' | 'browse' | 'music' | 'character' | 'language' | 'installed' | 'updates';

type DeleteConfirm = (title: string, message: string, onConfirm: () => void) => void;

type ConfirmUninstall = (name: string, run: () => Promise<void>) => void;

interface StoreProps {
  onLibraryChanged: () => unknown;
  onDeleteConfirm: DeleteConfirm;
  section?: StoreSection;
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

type OpenInstallParams = {
  signedIn: boolean;
  onOpen: (itemId: string) => void;
  install: (itemId: string, version: number | null) => void;
};

type InstallBarParams = {
  itemId: string;
  name: string;
  hasUpdate: boolean;
  onSignedOut: () => void;
  onConfirmUninstall: ConfirmUninstall;
};

type StoreModel = ReturnType<typeof useStore>;

type StoreAccount = ReturnType<typeof useStoreAccount>;

interface StoreBrowseProps {
  title: string;
  store: StoreModel;
}

interface StoreDetailProps {
  detail: ItemResponse;
  pack: InstalledPack | null;
  bar: CatalogInstallBarProps;
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

interface StoreHomeWelcomeProps {
  name: string;
  welcome: string | undefined;
  updateCount: number;
  onShowUpdates: () => void;
}

interface StoreInstalledListProps {
  title: string;
  rows: InstalledRow[];
  emptyText: string;
  store: StoreModel;
}

interface StoreInstalledRowProps {
  row: InstalledRow;
  canUpdate: boolean;
  onSignedOut: () => void;
  onConfirmUninstall: ConfirmUninstall;
}

interface StoreSectionContentProps {
  store: StoreModel;
}

interface StoreSignInProps {
  account: StoreAccount;
  waitingLink: CatalogLink | null;
}

export type {
  CatalogState,
  ConfirmUninstall,
  DeleteConfirm,
  InstallBarParams,
  InstalledRow,
  OpenInstallParams,

  StoreBrowseProps,
  StoreDetailPanelProps,
  StoreDetailProps,
  StoreGridProps,
  StoreHomeProps,
  StoreHomeWelcomeProps,
  StoreInstalledListProps,
  StoreInstalledRowProps,
  StoreModel,
  StoreProps,
  StoreSection,
  StoreSectionContentProps,
  StoreSignInProps,
};
