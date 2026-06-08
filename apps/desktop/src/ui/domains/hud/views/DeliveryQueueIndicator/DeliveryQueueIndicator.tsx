/* @layer renderer-hud @kind component */
/**
 * DeliveryQueueIndicator — bottom-right overlay showing the full delivery queue.
 * Visible only when items are queued. Shows up to 20 items individually,
 * with a "...N more" overflow indicator beyond that.
 */

import { HudBox } from '../../primitives/HudBox';
import { useDeliveryQueueStore } from '../../../../../stores/delivery-queue-store';
import type { DeliveryEntry } from '../../../../../lib/game/delivery-queue';

const MAX_VISIBLE = 20;

/** Color mapping for source types */
const SOURCE_COLORS: Record<string, string> = {
  cheat: '#f59e0b',       // amber
  randomizer: '#8b5cf6',  // purple
  network: '#06b6d4',     // cyan
  system: '#6b7280',      // gray
};

const getSourceColor = (source: string): string => {
  // Check known types first
  const lower = source.toLowerCase();
  for (const [key, color] of Object.entries(SOURCE_COLORS)) {
    if (lower.startsWith(key)) return color;
  }
  // Player names (source like "player:Name") get teal
  if (lower.startsWith('player')) return '#14b8a6';
  // Unknown sources get soft blue
  return '#60a5fa';
};

const getSourceLabel = (source: string): string => {
  // "player:Alice" → "Alice"
  if (source.includes(':')) return source.split(':').slice(1).join(':');
  return source;
};

// ─── Individual Queue Entry ───

interface QueueEntryProps {
  entry: DeliveryEntry;
  isActive: boolean;
}

const QueueEntry = ({ entry, isActive }: QueueEntryProps) => {
  const color = getSourceColor(entry.source);
  const label = getSourceLabel(entry.source);

  return (
    <HudBox
      className={`dq-entry ${isActive ? 'dq-entry--active' : 'dq-entry--pending'}`}
      style={{ '--source-color': color } as React.CSSProperties}
    >
      <HudBox className="dq-entry-indicator" />
      <HudBox className="dq-entry-content">
        <HudBox as="span" className="dq-entry-message">{entry.message}</HudBox>
      </HudBox>
      <HudBox as="span" className="dq-entry-tag">{label}</HudBox>
    </HudBox>
  );
};

// ─── Main Container ───

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
            …{overflow} more in queue
          </HudBox>
        )}
      </HudBox>
    </HudBox>
  );
};

export { DeliveryQueueIndicator };
