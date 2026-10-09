/* @layer renderer-hud @kind component */
import { HudBox } from '../../primitives/HudBox';
import { useDeliveryQueueStore } from '../../../../../stores/delivery-queue-store';
import { MAX_VISIBLE } from './DeliveryQueueIndicator.constants';
import { QueueEntry } from './sub-components/QueueEntry';

const DeliveryQueueIndicator = () => {
  const pending = useDeliveryQueueStore((s) => s.pending);
  const delivering = useDeliveryQueueStore((s) => s.delivering);

  const total = pending.length + (delivering ? 1 : 0);
  if (total === 0) return null;

  const visiblePending = pending.slice(0, delivering ? MAX_VISIBLE - 1 : MAX_VISIBLE);
  const overflow = pending.length - visiblePending.length;

  return (
    <HudBox className="dq-container">
      <HudBox className="dq-header">
        <HudBox as="span" className="dq-header-icon">▼</HudBox>
        <HudBox as="span" className="dq-header-title">Incoming</HudBox>
        <HudBox as="span" className="dq-header-count">{total}</HudBox>
      </HudBox>
      <HudBox className="dq-list">
        {delivering && (
          <QueueEntry entry={delivering} isActive={true} />
        )}
        {visiblePending.map((entry) => (
          <QueueEntry key={entry.id} entry={entry} isActive={false} />
        ))}
        {overflow > 0 && (
          <HudBox className="dq-overflow">
            ...{overflow} more in queue
          </HudBox>
        )}
      </HudBox>
    </HudBox>
  );
};

export { DeliveryQueueIndicator };
