import './SaveStateCard.css';

interface SaveStateCardProps {
  slot: number;
  screenshot: string | null;
  timestamp: number | null;
}

function formatTimeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function SaveStateCard({ slot, screenshot, timestamp }: SaveStateCardProps) {
  const isEmpty = !timestamp;

  return (
    <div className={`save-card ${isEmpty ? 'save-card--empty' : ''}`}>
      <div className="save-card__thumb">
        {screenshot ? (
          <img src={screenshot} alt={`Slot ${slot + 1}`} className="save-card__img" />
        ) : (
          <span className="save-card__placeholder">{isEmpty ? '—' : '?'}</span>
        )}
      </div>
      <div className="save-card__info">
        <span className="save-card__slot">Slot {slot + 1}</span>
        {timestamp && <span className="save-card__time">{formatTimeAgo(timestamp)}</span>}
      </div>
    </div>
  );
}
