/* @layer renderer-components @kind component */
/**
 * The one mark for a check's state, so the summary, the filter buttons and the
 * rows can never disagree about what "taken" looks like.
 */
import { Icon } from '@ds/primitives';
import type { IconProps } from '@ds/primitives';
import type { CheckStatus } from '@shared/game/logic/eval';
import { CHECK_PATHS, DOT_CIRCLES, RING_PATHS, STACK_PATHS } from '../ChecksTracker.constants';

/** The three check states plus the whole-set total the summary also marks. */
type StatusKey = CheckStatus | 'total';

interface CheckStatusIconProps {
  status: StatusKey;
  size?: number;
}

const STATUS_LABELS: Record<StatusKey, string> = {
  completed: 'Already collected',
  reachable: 'Reachable right now',
  blocked: 'Still out of reach',
  total: 'Every check',
};

const STATUS_SHAPES: Record<StatusKey, Pick<IconProps, 'paths' | 'circles'>> = {
  completed: { paths: CHECK_PATHS },
  reachable: { circles: DOT_CIRCLES },
  blocked: { paths: RING_PATHS },
  total: { paths: STACK_PATHS },
};

const CheckStatusIcon = (props: CheckStatusIconProps) => {
  const { status, size = 12 } = props;
  return (
    <Icon
      {...STATUS_SHAPES[status]}
      className={`tracker-status-icon tracker-status-icon--${status}`}
      size={size}
      role="img"
      aria-label={STATUS_LABELS[status]}
    />
  );
};

export { CheckStatusIcon, STATUS_LABELS };
export type { CheckStatusIconProps, StatusKey };
