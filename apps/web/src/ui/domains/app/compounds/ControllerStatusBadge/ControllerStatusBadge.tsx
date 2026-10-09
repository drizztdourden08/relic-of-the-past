/* @layer renderer-components @kind component */
import { Status } from '@drizztdourden08/tessera/primitives';
import { STATUS_LABEL } from './ControllerStatusBadge.constants';
import type { ControllerStatusBadgeProps } from './ControllerStatusBadge.type';

const ControllerStatusBadge = (props: ControllerStatusBadgeProps) => {
  const { status } = props;
  return <Status tone={status === 'ready' ? 'success' : 'warning'}>{STATUS_LABEL[status]}</Status>;
};

export { ControllerStatusBadge };
