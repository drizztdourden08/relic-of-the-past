/* @layer renderer-components @kind component */
/**
 * A GROUP THAT CANNOT BE EDITED YET, WITH THE CAUSE ON IT. This answers F5's
 * "a sentence explaining why a control is inert is a control nobody designed".
 *
 * The panel's old shape was four greyed spinners and a paragraph BESIDE them,
 * in two sections, worded differently each time. This keeps the fields visible,
 * because a property that vanishes when you flip a switch is one you stop trusting.
 * It puts the reason ON the surface and offers the one control that would lift
 * the lock as an action instead of as prose telling you to go and find it.
 *
 * IT IS `DisabledOverlay`, NOT A SECOND SCRIM. That composite already owns the
 * hard parts: `inert` on the covered subtree (so a locked field is out of the
 * tab order and out of the a11y tree, which `disabled` on four inputs never
 * achieved), the scrim above it, and the optional action. What this adds is the
 * inspector's density and a name that says what it is for. A 232 px rail cannot
 * spend 16 px of padding and a semibold 13 px line on a lock.
 *
 * `contained` ALWAYS: every caller sits inside the inspector rail, which
 * scrolls, so the default 10 px overhang would be clipped by the rail or spill
 * onto the still-editable row above.
 */
import { DisabledOverlay } from '@ds/composites/DisabledOverlay';
import type { ReactNode } from 'react';

interface DisabledReasonProps {
  active: boolean;
  /** Why these controls are inert. One sentence, in the panel's own voice. */
  reason: string;
  /** The control that would lift the lock. Omitted for a lock nothing here can
   *  undo. The screen root's rectangle is the view, and no button changes it. */
  actionLabel?: string;
  onAction?: () => void;
  children: ReactNode;
}

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
export type { DisabledReasonProps };
