/* @layer shared-types @kind logic */
/**
 * The join-table rows of the sites on the shared accounts: the account sign-in, the
 * Sanctuary and the Hookshop. Split out of maps.ts for the line cap and spread into its
 * tables, so INVOKE_MAP and EVENT_MAP stay the one join the preload and `window.api` read.
 */
import type { InvokeContract } from './invoke-contract';
import type { EventContract } from './event-contract';

const SITE_INVOKE_MAP = {
  beginHubSignIn: 'hub:beginDeviceSignIn',
  cancelHubSignIn: 'hub:cancelDeviceSignIn',
  hubSignOut: 'hub:signOut',
  hubMe: 'hub:me',
  submitSanctuaryReport: 'sanctuary:submitReport',
  retrySanctuaryUpload: 'sanctuary:retryUpload',
  storeHome: 'store:home',
  storeItems: 'store:items',
  storeItem: 'store:item',
  storeInstall: 'store:install',
  storeUninstall: 'store:uninstall',
  storeInstalled: 'store:installed',
  storeCancel: 'store:cancel',
} as const satisfies Record<string, keyof InvokeContract>;

const SITE_EVENT_MAP = {
  onHubDeviceCode: 'hub:deviceCode',
  onStoreInstallProgress: 'store:installProgress',
  onStoreOpenInstall: 'store:openInstall',
} as const satisfies Record<string, keyof EventContract>;

export { SITE_INVOKE_MAP, SITE_EVENT_MAP };
