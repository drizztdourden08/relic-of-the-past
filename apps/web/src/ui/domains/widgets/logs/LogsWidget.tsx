/* @layer renderer-widgets @kind component */
/**
 * Content for the Logs widget.
 * Adapts the existing log-bus subscription into widget content form.
 */
import { useState, useEffect, useRef } from 'react';
import { Box } from '../../../design-system/primitives/Box';
import { Text } from '../../../design-system/primitives/Text';
import { subscribe, getEntries, CHANNEL_COLORS, type LogEntry } from '../../../../lib/log-bus';
import { MAX_ENTRIES } from './logs.constants';
import { formatTime } from './behavior/formatTime';
import './LogsWidget.css';

const LogsWidgetContent = () => {
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
    <Box className="logs-widget-content">
      {entries.length === 0 && <Box className="logs-widget__empty">No log entries yet.</Box>}
      {entries.map((entry, i) => (
        <Box key={`${entry.id}-${i}`} className={`log-entry log-entry--${entry.level}`}>
          <Text className="log-entry__time">{formatTime(entry.timestamp)}</Text>
          <Text className="log-entry__channel" style={{ color: CHANNEL_COLORS[entry.channel] }}>
            {entry.channel}:
          </Text>
          <Text className="log-entry__message">{entry.message}</Text>
        </Box>
      ))}
      <Box ref={bottomRef} />
    </Box>
  );
}

export { LogsWidgetContent };
