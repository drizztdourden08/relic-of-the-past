/* @layer renderer-widgets @kind component */
/**
 * LogsWidgetContent — Content for the Logs widget.
 * Adapts the existing log-bus subscription into widget content form. Rows keep their
 * component structure; selection works on whole lines (click, ctrl-click, shift-click)
 * and the toolbar copies everything, the selection, or the error lines.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { Box } from '../../../design-system/primitives/Box';
import { Text } from '../../../design-system/primitives/Text';
import { subscribe, getEntries, CHANNEL_COLORS, type LogEntry } from '../../../../lib/log-bus';
import { MAX_ENTRIES } from './logs.constants';
import { formatTime } from './behavior/formatTime';
import { formatLogLines } from './behavior/formatLogLines';
import { useLogSelection } from './behavior/useLogSelection';
import { LogsToolbar } from './sub-components/LogsToolbar';
import './LogsWidget.css';

const LogsWidgetContent = () => {
  const [entries, setEntries] = useState<LogEntry[]>(() => getEntries());
  const bottomRef = useRef<HTMLDivElement>(null);
  const { selected, handleLineClick } = useLogSelection(entries);

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

  const copy = useCallback((lines: readonly LogEntry[]) => {
    if (lines.length > 0) void navigator.clipboard.writeText(formatLogLines(lines));
  }, []);
  const handleCopyAll = useCallback(() => copy(entries), [copy, entries]);
  const handleCopySelection = useCallback(
    () => copy(entries.filter((entry) => selected.has(entry.id))),
    [copy, entries, selected]);
  const handleCopyErrors = useCallback(
    () => copy(entries.filter((entry) => entry.level === 'error')),
    [copy, entries]);

  return (
    <Box className="logs-widget">
      <LogsToolbar
        selectionCount={selected.size}
        onCopyAll={handleCopyAll}
        onCopySelection={handleCopySelection}
        onCopyErrors={handleCopyErrors}
      />
      <Box className="logs-widget-content">
        {entries.length === 0 && <Box className="logs-widget__empty">No log entries yet.</Box>}
        {entries.map((entry, i) => (
          <Box
            key={`${entry.id}-${i}`}
            className={`log-entry log-entry--${entry.level}${selected.has(entry.id) ? ' log-entry--selected' : ''}`}
            onClick={(event: React.MouseEvent) => handleLineClick(event, i)}
          >
            <Text className="log-entry__time">{formatTime(entry.timestamp)}</Text>
            <Text className="log-entry__channel" style={{ color: CHANNEL_COLORS[entry.channel] }}>
              {entry.channel}:
            </Text>
            <Text className="log-entry__message">{entry.message}</Text>
          </Box>
        ))}
        <Box ref={bottomRef} />
      </Box>
    </Box>
  );
}

export { LogsWidgetContent };
