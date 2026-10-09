/* @layer renderer-components @kind constants */
import type { AccessState } from '@shared/hub';
import type { StatusTone } from '@drizztdourden08/tessera/primitives';

const ACCESS_VARIANT: Record<AccessState, StatusTone> = {
  admin: 'success',
  member: 'success',
  pending: 'warning',
  revoked: 'danger',
};

export { ACCESS_VARIANT };
