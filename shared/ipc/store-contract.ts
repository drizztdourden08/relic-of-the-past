/* @layer shared-types @kind types */
/**
 * The Hookshop invoke channels: the catalogue, one item, and installing, updating,
 * uninstalling and duplicating packs. The main process calls the store API with the device token, so the
 * renderer never holds it. Split out of `InvokeContract` (which extends this) for the line
 * cap; the signatures have their one source of truth here. Install progress and the links a
 * browser opens arrive on the `store:installProgress` and `store:openInstall` EVENTS.
 */
import type { HomeResponse, ItemResponse } from '@shared/store/api-types';
import type { ItemCardView } from '@shared/store/home-types';
import type { InstalledPack } from '@shared/store/installed-types';
import type { InstallProgress } from '@shared/store/install/installer.type';
import type { StoreKind } from '@shared/store/types';

/**
 * Every call answers with its data or why not. `signedOut` is set when no device token is
 * held or the API refused it, so the view can show the sign-in card.
 */
type StoreResult<T> = { ok: true; data: T } | { ok: false; error: string; signedOut: boolean };

/** Which version to install; null takes the live one. */
type StoreInstallRequest = { itemId: string; version: number | null };

/** A cancelled install answers `cancelled` with nothing written. */
type StoreInstallResult =
  | { ok: true; pack: InstalledPack }
  | { ok: false; error: string; signedOut: boolean; cancelled: boolean };

/** The profiles whose selection pointed at the pack and went back to the default. */
type StoreUninstallResult = { ok: true; releasedProfiles: string[] } | { ok: false; error: string };

/** The editable copy a duplicate made: its kind, and its pack folder, sprite file name or set id. */
type StoreDuplicateResult = { kind: StoreKind; name: string };

/** One report per step of a running install, keyed by the item. */
type StoreInstallProgress = { itemId: string; progress: InstallProgress };

/** A `relic-of-the-past://install/<id>` link the browser opened, for the Hookshop tab to install. */
type StoreOpenInstall = { itemId: string; version: number | null };

interface StoreInvokeContract {
  'store:home': () => Promise<StoreResult<HomeResponse>>;
  /** Every published item, all pages, or those of one kind. */
  'store:items': (kind: StoreKind | null) => Promise<StoreResult<ItemCardView[]>>;
  'store:item': (itemId: string) => Promise<StoreResult<ItemResponse>>;
  /** Download, check the sha256, unpack, record. An installed item is replaced (an update). */
  'store:install': (request: StoreInstallRequest) => Promise<StoreInstallResult>;
  /** Releases any profile that selects the pack, removes its files, drops the record. */
  'store:uninstall': (itemId: string) => Promise<StoreUninstallResult>;
  /**
   * Copies an installed item to a free new name the player can edit, crediting the original in
   * the copy's `basedOn`. Refused, with the reason, when its licence does not allow copies.
   */
  'store:duplicate': (itemId: string) => Promise<StoreResult<StoreDuplicateResult>>;
  'store:installed': () => Promise<InstalledPack[]>;
  /** Stops the install of that item; its pending `store:install` answers cancelled. */
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
