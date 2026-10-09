/* @layer shared-store @kind constants */
import { describeStorePermissions } from './describe-store-permissions';
import { STORE_PERMISSION_LABELS } from './store-permission-labels.constants';
import type { StorePermission } from './store-permissions.type';

const STORE_PERMISSIONS = {
  all: ['review', 'feature'] as readonly StorePermission[],
  labels: STORE_PERMISSION_LABELS,
  describe: describeStorePermissions,
};

export { STORE_PERMISSIONS };
