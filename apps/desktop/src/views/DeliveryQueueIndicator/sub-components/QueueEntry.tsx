/* @layer renderer-hud @kind component */
import type { CSSProperties } from 'react';
import { HudBox } from '../../../primitives/HudBox';
import { sourceColor } from '../behavior/source-color';
import { sourceLabel } from '../behavior/source-label';
import type { QueueEntryProps } from '../DeliveryQueueIndicator.type';

const QueueEntry = ({ entry, isActive }: QueueEntryProps) => {
  const color = sourceColor(entry.source);
  const label = sourceLabel(entry.source);

  return (
    <HudBox
      className={`dq-entry ${isActive ? 'dq-entry--active' : 'dq-entry--pending'}`}
      style={{ '--source-color': color } as CSSProperties}
    >
      <HudBox className="dq-entry-indicator" />
      <HudBox className="dq-entry-content">
        <HudBox as="span" className="dq-entry-message">{entry.message}</HudBox>
      </HudBox>
      <HudBox as="span" className="dq-entry-tag">{label}</HudBox>
    </HudBox>
  );
};

export { QueueEntry };
