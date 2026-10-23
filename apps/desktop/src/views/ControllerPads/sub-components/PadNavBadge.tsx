/* @layer renderer-components @kind component */
import { Status } from '@drizztdourden08/tessera/primitives';
import { CONNECTED_LABEL, UNAVAILABLE_LABEL } from '../ControllerPads.constants';
import type { PadNavBadgeProps } from '../ControllerPads.type';

const PadNavBadge = ({ connected }: PadNavBadgeProps) => (
  <Status dot tone={connected ? 'success' : 'warning'} aria-label={connected ? CONNECTED_LABEL : UNAVAILABLE_LABEL}>
    {null}
  </Status>
);

export { PadNavBadge };
