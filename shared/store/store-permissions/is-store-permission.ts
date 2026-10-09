/* @layer shared-store @kind logic */
import { STORE_PERMISSIONS } from './store-permissions.constants';
import type { StorePermission } from './store-permissions.type';

const isStorePermission = (value: unknown): value is StorePermission =>
  STORE_PERMISSIONS.all.includes(value as StorePermission);

export { isStorePermission };
