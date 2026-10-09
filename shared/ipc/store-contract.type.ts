/* @layer shared-types @kind types */
import type { HomeResponse, ItemResponse } from '@shared/store/api-types';
import type { ItemCardView } from '@shared/store/home-types';
import type { InstalledPack } from '@shared/store/installed-types';
import type { InstallProgress } from '@shared/store/install/installer.type';
import type { StoreKind } from '@shared/store/types';

type StoreResult<T> = { ok: true; data: T } | { ok: false; error: string; signedOut: boolean };

type StoreInstallRequest = { itemId: string; version: number | null };

type StoreInstallResult =
  | { ok: true; pack: InstalledPack }
  | { ok: false; error: string; signedOut: boolean; cancelled: boolean };

type StoreUninstallResult = { ok: true; releasedProfiles: string[] } | { ok: false; error: string };

type StoreDuplicateResult = { kind: StoreKind; name: string };

type StoreInstallProgress = { itemId: string; progress: InstallProgress };

type StoreOpenInstall = { itemId: string; version: number | null };

interface StoreInvokeContract {
  'store:home': () => Promise<StoreResult<HomeResponse>>;
  'store:items': (kind: StoreKind | null) => Promise<StoreResult<ItemCardView[]>>;
  'store:item': (itemId: string) => Promise<StoreResult<ItemResponse>>;
  'store:install': (request: StoreInstallRequest) => Promise<StoreInstallResult>;
  'store:uninstall': (itemId: string) => Promise<StoreUninstallResult>;
  'store:duplicate': (itemId: string) => Promise<StoreResult<StoreDuplicateResult>>;
  'store:installed': () => Promise<InstalledPack[]>;
  'store:cancel': (itemId: string) => Promise<void>;
}

export type {
  StoreInvokeContract,
  StoreResult,
  StoreInstallRequest,
  StoreInstallResult,
  StoreUninstallResult,
  StoreDuplicateResult,
  StoreInstallProgress,
  StoreOpenInstall,
};
