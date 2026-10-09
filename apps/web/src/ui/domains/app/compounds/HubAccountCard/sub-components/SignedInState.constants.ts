/* @layer renderer-components @kind constants */
import type { AccessState } from '@shared/hub';
import type { BadgeVariant } from '@ds/primitives/Badge/Badge.type';

const ACCESS_VARIANT: Record<AccessState, BadgeVariant> = {
  admin: 'success',
  member: 'success',
  pending: 'warning',
  revoked: 'danger',
};

export { ACCESS_VARIANT };
