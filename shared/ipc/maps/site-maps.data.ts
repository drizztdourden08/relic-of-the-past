/* @layer shared-types @kind data */
import type { InvokeContract } from '../invoke-contract.type';
import type { EventContract } from '../event-contract.type';

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
  storeDuplicate: 'store:duplicate',
  storeInstalled: 'store:installed',
  storeCancel: 'store:cancel',
} as const satisfies Record<string, keyof InvokeContract>;

const SITE_EVENT_MAP = {
  onHubDeviceCode: 'hub:deviceCode',
  onStoreInstallProgress: 'store:installProgress',
  onStoreOpenInstall: 'store:openInstall',
} as const satisfies Record<string, keyof EventContract>;

export { SITE_INVOKE_MAP, SITE_EVENT_MAP };
