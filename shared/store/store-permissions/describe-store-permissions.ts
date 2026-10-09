/* @layer shared-store @kind logic */
import { STORE_PERMISSION_LABELS } from './store-permission-labels.constants';
import type { StorePermission } from './store-permissions.type';

const describeStorePermissions = (granted: readonly StorePermission[]): string => (granted.length > 0
  ? granted.map((permission) => STORE_PERMISSION_LABELS[permission]).join(' · ')
  : 'no store rights');

export { describeStorePermissions };
