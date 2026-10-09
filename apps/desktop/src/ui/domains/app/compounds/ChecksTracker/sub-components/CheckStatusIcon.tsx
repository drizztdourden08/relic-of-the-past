/* @layer renderer-components @kind component */
import { Icon } from '@drizztdourden08/tessera/primitives';
import { STATUS_LABELS, STATUS_SHAPES } from '../ChecksTracker.constants';
import type { CheckStatusIconProps, StatusKey } from '../ChecksTracker.type';

const CheckStatusIcon = (props: CheckStatusIconProps) => {
  const { status, size = 12 } = props;
  return (
    <Icon
      path={STATUS_SHAPES[status]}
      className={`tracker-status-icon tracker-status-icon--${status}`}
      size={size}
      role="img"
      aria-label={STATUS_LABELS[status]}
    />
  );
};

export { CheckStatusIcon };
export type { CheckStatusIconProps, StatusKey };
