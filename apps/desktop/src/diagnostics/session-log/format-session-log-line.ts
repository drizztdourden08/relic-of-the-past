/* @layer renderer-lib @kind logic */
import type { LogEntry } from '../../log-bus';
import { FILE_TAGS } from './format-session-log-line.constants';

const formatSessionLogLine = (entry: LogEntry): string => {
  const { timestamp, level, channel, message } = entry;
  const tag = FILE_TAGS[channel] ?? channel;
  return `[${new Date(timestamp).toISOString()}] [${level}] [${tag}] ${message}`;
};

export { formatSessionLogLine };
