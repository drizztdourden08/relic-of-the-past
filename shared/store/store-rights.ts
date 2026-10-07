/* @layer shared-store @kind data */
/**
 * The store's rights model: the permissions a group can grant on the store. The group
 * editor shows these beside the Sanctuary's, and store-api resolves a caller's rights
 * through it.
 */
import type { RightsModel } from '../hub/rights-model.type';
import { STORE_PERMISSIONS } from './store-permissions';
import type { StorePermission } from './store-permissions';

const STORE_RIGHTS: RightsModel<StorePermission> = {
  site: 'store',
  all: STORE_PERMISSIONS.all,
  labels: STORE_PERMISSIONS.labels,
  describe: (granted) => STORE_PERMISSIONS.describe(granted.filter((p): p is StorePermission => STORE_PERMISSIONS.all.includes(p as StorePermission))),
};

export { STORE_RIGHTS };
