/* @layer store-api @kind constants */
const STORE_COLLECTIONS = {
  items: 'store-items',
  ratings: 'store-ratings',
  installs: 'store-installs',
  daily: 'store-daily',
  quotas: 'store-quotas',
  settings: 'store-settings',
} as const;

export { STORE_COLLECTIONS };
