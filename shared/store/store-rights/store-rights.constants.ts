/* @layer shared-store @kind constants */
import type { RightsModel } from '../../hub/rights-model.type';
import { STORE_PERMISSIONS } from '../store-permissions';
import type { StorePermission } from '../store-permissions';
import { describeStoreRights } from './describe-store-rights';

const STORE_RIGHTS: RightsModel<StorePermission> = {
  site: 'store',
  all: STORE_PERMISSIONS.all,
  labels: STORE_PERMISSIONS.labels,
  describe: describeStoreRights,
};

export { STORE_RIGHTS };
