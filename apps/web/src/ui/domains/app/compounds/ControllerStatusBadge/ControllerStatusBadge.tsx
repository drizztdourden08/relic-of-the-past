/* @layer renderer-components @kind component */
import { Badge } from '../../../../design-system/primitives/Badge';
import { STATUS_LABEL } from './ControllerStatusBadge.constants';
import type { ControllerStatusBadgeProps } from './ControllerStatusBadge.type';

const ControllerStatusBadge = (props: ControllerStatusBadgeProps) => {
  const { status } = props;
  return <Badge variant={status === 'ready' ? 'success' : 'warning'}>{STATUS_LABEL[status]}</Badge>;
};

export { ControllerStatusBadge };
