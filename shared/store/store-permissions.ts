/* @layer shared-store @kind constants */
/**
 * What a group can be granted on the store. Admins hold both. The shape matches a site's
 * rights model minus its site id, so the hub's RightsModel wraps it as is.
 */

type StorePermission = 'review' | 'feature';

const STORE_PERMISSION_LABELS: Record<StorePermission, string> = {
  review: 'Review submissions',
  feature: 'Feature items and edit the home page',
};

const STORE_PERMISSIONS = {
  all: ['review', 'feature'] as readonly StorePermission[],
  labels: STORE_PERMISSION_LABELS,
  /** The one-line summary the groups list shows. */
  describe: (granted: readonly StorePermission[]): string => (granted.length > 0
    ? granted.map((permission) => STORE_PERMISSION_LABELS[permission]).join(' · ')
    : 'no store rights'),
};

const isStorePermission = (value: unknown): value is StorePermission =>
  STORE_PERMISSIONS.all.includes(value as StorePermission);

export { STORE_PERMISSIONS, isStorePermission };
export type { StorePermission };
