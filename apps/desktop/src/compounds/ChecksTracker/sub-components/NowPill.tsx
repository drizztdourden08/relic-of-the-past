/* @layer renderer-components @kind component */
import { Status } from '@drizztdourden08/tessera/primitives';
import type { NowPillProps } from '../ChecksTracker.type';

const NowPill = ({ now, status, className }: NowPillProps) => {
  if (now === undefined || (!now && status !== 'completed')) return null;
  return (
    <Status className={className} tone={now ? 'success' : 'neutral'} variant="pill">{now ? 'now' : 'not now'}</Status>
  );
};

export { NowPill };
