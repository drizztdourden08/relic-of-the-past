/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Icon } from '@drizztdourden08/tessera/primitives';
import { statusLabels, STATUS_SHAPES } from '../ChecksTracker.constants';
import type { CheckStatusIconProps } from '../ChecksTracker.type';
import './CheckStatusIcon.css';

const CheckStatusIcon = (props: CheckStatusIconProps) => {
  const t = useT();
  const { status, size = 12 } = props;
  return (
    <Icon
      path={STATUS_SHAPES[status]}
      className={`tracker-status-icon tracker-status-icon--${status}`}
      size={size}
      role="img"
      aria-label={statusLabels(t)[status]}
    />
  );
};

export { CheckStatusIcon };
