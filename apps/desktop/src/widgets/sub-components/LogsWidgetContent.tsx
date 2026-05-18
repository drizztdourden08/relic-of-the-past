/**
 * LogsWidgetContent — Content for the Logs widget.
 * Adapts the existing log-bus subscription into widget content form.
 */
import { useState, useEffect, useRef } from 'react';
import { subscribe, getEntries, CHANNEL_COLORS, type LogEntry } from '../../lib/log-bus';

const MAX_ENTRIES = 200;

const formatTime = (ts: number): string => {
  const d = new Date(ts);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
}

export const LogsWidgetContent = () => {
  const [entries, setEntries] = useState<LogEntry[]>(() => getEntries());
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return subscribe((entry) => {
      setEntries((prev) => {
        const next = [...prev, entry];
        return next.length > MAX_ENTRIES ? next.slice(-MAX_ENTRIES) : next;
      });
    });
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries]);

  return (
    <div className="logs-widget-content">
      {entries.map((entry, i) => (
        <div key={`${entry.id}-${i}`} className={`log-entry log-entry--${entry.level}`}>
          <span className="log-entry__time">{formatTime(entry.timestamp)}</span>
          <span className="log-entry__channel" style={{ color: CHANNEL_COLORS[entry.channel] }}>
            {entry.channel}:
          </span>
          <span className="log-entry__message">{entry.message}</span>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
