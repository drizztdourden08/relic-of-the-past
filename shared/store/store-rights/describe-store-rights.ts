/* @layer shared-store @kind logic */
import { STORE_PERMISSIONS, isStorePermission } from '../store-permissions';

const describeStoreRights = (granted: readonly string[]): string =>
  STORE_PERMISSIONS.describe(granted.filter(isStorePermission));

export { describeStoreRights };
