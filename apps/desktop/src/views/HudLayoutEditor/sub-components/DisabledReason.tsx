/* @layer renderer-components @kind component */
import { DisabledOverlay } from '@drizztdourden08/tessera/composites';
import type { DisabledReasonProps } from './DisabledReason.type';

const DisabledReason = (props: DisabledReasonProps) => {
  const { active, reason, actionLabel, onAction, children } = props;

  return (
    <DisabledOverlay
      active={active}
      contained
      message={reason}
      actionLabel={actionLabel}
      onOpenSettings={actionLabel !== undefined ? onAction : undefined}
      className="hud-disabled-reason"
    >
      {children}
    </DisabledOverlay>
  );
};

export { DisabledReason };
