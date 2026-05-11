import { useRef } from 'react';
import { IconButton } from '../../primitives/IconButton';
import { useLogOverlay } from './behavior/useLogOverlay';
import { CHANNEL_COLORS } from '../../../lib/log-bus';
import './LogOverlay.css';

function formatTime(ts: number): string {
  const d = new Date(ts);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
}

interface LogOverlayProps {
  visible: boolean;
  onClose: () => void;
}

export function LogOverlay({ visible: externalVisible, onClose }: LogOverlayProps): JSX.Element | null {
  const bottomRef = useRef<HTMLDivElement>(null);
  const { visible: f12Visible, entries } = useLogOverlay(bottomRef);

  const show = externalVisible || f12Visible;
  if (!show) return null;

  return (
    <div className="log-overlay">
      <div className="log-overlay__header">
        <span className="log-overlay__title">Log</span>
        <span className="log-overlay__hint">F12 to toggle</span>
        <IconButton variant="ghost" size="sm" label="Close logs" onClick={onClose}>
          <svg width="10" height="10" viewBox="0 0 14 14" fill="currentColor">
            <path d="M1.5 0.5L7 6L12.5 0.5L13.5 1.5L8 7L13.5 12.5L12.5 13.5L7 8L1.5 13.5L0.5 12.5L6 7L0.5 1.5Z" />
          </svg>
        </IconButton>
      </div>
      <div className="log-overlay__body">
        {entries.map((entry) => (
          <div key={entry.id} className={`log-entry log-entry--${entry.level}`}>
            <span className="log-entry__time">{formatTime(entry.timestamp)}</span>
            <span className="log-entry__channel" style={{ color: CHANNEL_COLORS[entry.channel] }}>
              {entry.channel}:
            </span>
            <span className="log-entry__message">{entry.message}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
