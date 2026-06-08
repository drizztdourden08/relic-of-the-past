/* @layer renderer-hud @kind component */
/**
 * DeliveryQueueIndicator — bottom-right overlay showing the full delivery queue.
 * Visible only when items are queued. Shows up to 20 items individually,
 * with a "...N more" overflow indicator beyond that.
 */

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
    <div
      className={`dq-entry ${isActive ? 'dq-entry--active' : 'dq-entry--pending'}`}
      style={{ '--source-color': color } as React.CSSProperties}
    >
      <div className="dq-entry-indicator" />
      <div className="dq-entry-content">
        <span className="dq-entry-message">{entry.message}</span>
      </div>
      <span className="dq-entry-tag">{label}</span>
    </div>
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
    <div className="dq-container">
      <div className="dq-header">
        <span className="dq-header-icon">▼</span>
        <span className="dq-header-title">Incoming</span>
        <span className="dq-header-count">{total}</span>
      </div>
      <div className="dq-list">
        {delivering && (
          <QueueEntry entry={delivering} isActive={true} />
        )}
        {visiblePending.map((entry) => (
          <QueueEntry key={entry.id} entry={entry} isActive={false} />
        ))}
        {overflow > 0 && (
          <div className="dq-overflow">
            …{overflow} more in queue
          </div>
        )}
      </div>
    </div>
  );
};

export { DeliveryQueueIndicator };
