/* @layer renderer-components @kind constants */
import type { AccessState } from '@rotp/hub-contracts';
import type { StatusTone } from '@drizztdourden08/tessera/primitives';

const ACCESS_VARIANT: Record<AccessState, StatusTone> = {
  admin: 'success',
  member: 'success',
  pending: 'warning',
  revoked: 'danger',
};

export { ACCESS_VARIANT };
