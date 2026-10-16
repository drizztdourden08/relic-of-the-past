/* @layer renderer-components @kind types */
import type { CatalogInstallBarProps, CatalogLink } from '@drizztdourden08/brock-catalog/renderer';
import type { InstalledPack, HomeResponse, ItemResponse, ItemCardView, StoreKind } from '@rotp/hub-contracts';
import type { StoreItemStatus } from '../../compounds/StoreItemCard';
import type { useStore } from './behavior/useStore';
import type { useStoreAccount } from './behavior/useStoreAccount';

type DeleteConfirm = (title: string, message: string, onConfirm: () => void) => void;

type ConfirmUninstall = (name: string, run: () => Promise<void>) => void;

interface StoreParams {
  kind: StoreKind | null;
  item?: string;
}

interface InstalledRow {
  pack: InstalledPack;
  item: ItemCardView | null;
  hasUpdate: boolean;
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

interface StoreInstalledViewProps {
  mode: 'installed' | 'updates';
}

interface StoreSignInProps {
  account: StoreAccount;
  waitingLink: CatalogLink | null;
}

export type {
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
  StoreInstalledViewProps,
  StoreModel,
  StoreParams,
  StoreSignInProps,
};
