/* @layer renderer-components @kind component */
/**
 * The ready/unavailable dichotomy that replaces the old listed-or-invisible
 * model: 'ready' means SDL3 claimed the device, 'unavailable' means it's
 * visible to the device lister but not claimed.
 */
import { Badge } from '../../../../design-system/primitives/Badge';
import type { ControllerStatusBadgeProps } from './ControllerStatusBadge.type';

const LABEL = { ready: 'Ready', unavailable: 'Unavailable' } as const;

const ControllerStatusBadge = (props: ControllerStatusBadgeProps) => {
  const { status } = props;
  return <Badge variant={status === 'ready' ? 'success' : 'warning'}>{LABEL[status]}</Badge>;
};

export { ControllerStatusBadge };
