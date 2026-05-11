import type { PlaySession } from '@shared/types/session';
import './PlaySessionCard.css';

interface PlaySessionCardProps {
  session: PlaySession;
}

function formatSessionDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function formatDuration(ms: number): string {
  const totalMin = Math.floor(ms / 60000);
  if (totalMin < 60) return `${totalMin}m`;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function PlaySessionCard({ session }: PlaySessionCardProps) {
  return (
    <div className="session-card">
      <span className="session-card__dot" />
      <span className="session-card__date">{formatSessionDate(session.startedAt)}</span>
      {session.endedAt && (
        <span className="session-card__end">→ {new Date(session.endedAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
      )}
      <span className="session-card__duration">{formatDuration(session.durationMs)}</span>
    </div>
  );
}
