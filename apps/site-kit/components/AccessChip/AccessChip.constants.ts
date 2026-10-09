/* @layer site-kit @kind constants */
import { defineStatuses } from '@drizztdourden08/tessera/primitives';
import type { AccessState } from '@rotp/hub-contracts';

const ACCESS_STATUSES = defineStatuses({
  admin: { label: 'admin', tone: 'primary' },
  member: { label: 'member', tone: 'success' },
  pending: { label: 'pending', tone: 'warning' },
  revoked: { label: 'revoked', tone: 'danger' },
}) satisfies Record<AccessState, unknown>;

export { ACCESS_STATUSES };
