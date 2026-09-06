/* @layer renderer-lib @kind logic */
/**
 * Formats one log-bus entry as a session.log line:
 * `[ISO timestamp] [level] [tag] message`.
 */
import type { LogChannel, LogEntry } from '../../log-bus';

// The 'core' channel carries the game core's stdout/stderr (the Module print
// handlers route it there), so those lines are tagged [wasm] in the file,
// one greppable tag for everything coming out of the compiled core.
const FILE_TAGS: Partial<Record<LogChannel, string>> = { core: 'wasm' };

const formatSessionLogLine = (entry: LogEntry): string => {
  const { timestamp, level, channel, message } = entry;
  const tag = FILE_TAGS[channel] ?? channel;
  return `[${new Date(timestamp).toISOString()}] [${level}] [${tag}] ${message}`;
};

export { formatSessionLogLine };
