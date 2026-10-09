/* @layer shared-store @kind constants */
import type { StorePermission } from './store-permissions.type';

const STORE_PERMISSION_LABELS: Record<StorePermission, string> = {
  review: 'Review submissions',
  feature: 'Feature items and edit the home page',
};

export { STORE_PERMISSION_LABELS };
