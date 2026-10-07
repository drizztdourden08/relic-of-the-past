/* @layer renderer-widgets @kind logic */
/** The clipboard form of log entries, line for line as the widget shows them. */
import { formatTime } from './formatTime';
import type { LogEntry } from '../../../../../lib/log-bus';

const formatLogLines = (entries: readonly LogEntry[]): string =>
  entries.map((entry) => `${formatTime(entry.timestamp)} ${entry.channel}: ${entry.message}`).join('\n');

export { formatLogLines };
