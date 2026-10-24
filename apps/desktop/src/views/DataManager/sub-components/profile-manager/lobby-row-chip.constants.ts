/* @layer renderer-components @kind constants */
import type { StatusTone } from '@drizztdourden08/tessera/primitives';
import type { MembershipState } from '@app/game/archipelia';

const ROW_CHIPS: Readonly<Record<MembershipState['kind'], { label: string; tone: StatusTone } | null>> = {
  pending: { label: 'Waiting for host', tone: 'warning' },
  failed: { label: 'Waiting for host', tone: 'warning' },
  approved: { label: 'Approved', tone: 'success' },
  refused: { label: 'Refused', tone: 'danger' },
  gone: { label: 'Lobby gone', tone: 'danger' },
  started: null,
};

export { ROW_CHIPS };
