/* @layer renderer-components @kind constants */
import type { StatusTone } from '@drizztdourden08/tessera/primitives';
import type { MembershipState } from '@drizztdourden08/brock-randomizer/renderer';

const ROW_CHIPS: Readonly<Record<MembershipState['kind'], { label: string; tone: StatusTone } | null>> = {
  pending: { label: 'Waiting', tone: 'warning' },
  failed: { label: 'Waiting', tone: 'warning' },
  approved: { label: 'Approved', tone: 'success' },
  refused: { label: 'Refused', tone: 'danger' },
  gone: { label: 'Lobby gone', tone: 'danger' },
  started: null,
};

export { ROW_CHIPS };
