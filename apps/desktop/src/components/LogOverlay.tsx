import { useEffect, useRef, useState, useCallback } from 'react';
import { subscribe, getEntries, CHANNEL_COLORS, type LogEntry } from '../lib/log-bus';

export function LogOverlay(): JSX.Element | null {
  const [visible, setVisible] = useState(true);
  const [entries, setEntries] = useState<LogEntry[]>(() => [...getEntries()]);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Subscribe to new log entries
  useEffect(() => {
    return subscribe((entry) => {
      setEntries((prev) => {
        const next = [...prev, entry];
        return next.length > 200 ? next.slice(-200) : next;
      });
    });
  }, []);

  // Auto-scroll to bottom on new entries
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries]);

  // Toggle with F12
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'F12' && !e.ctrlKey && !e.altKey && !e.shiftKey) {
      e.preventDefault();
      setVisible((v) => !v);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!visible) return null;

  const formatTime = (ts: number): string => {
    const d = new Date(ts);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
  };

  return (
    <div className="log-overlay">
      <div className="log-overlay-header">
        <span className="log-overlay-title">Log</span>
        <span className="log-overlay-hint">F12 to toggle</span>
      </div>
      <div className="log-overlay-body">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className={`log-entry log-level-${entry.level}`}
          >
            <span className="log-time">{formatTime(entry.timestamp)}</span>
            <span
              className="log-channel"
              style={{ color: CHANNEL_COLORS[entry.channel] }}
            >
              {entry.channel}:
            </span>
            <span className="log-message">{entry.message}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
