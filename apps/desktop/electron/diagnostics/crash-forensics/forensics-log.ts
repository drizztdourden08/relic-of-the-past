/* @layer electron-main @kind logic */
/**
 * The one write path for crash-forensics lines. The terminal is written directly
 * instead of through console: the dev file logger wraps console to mirror it, so
 * going through it would put every line in main-console.log twice. `sync` is for
 * handlers that may be the last thing to run before the process dies; `terminal`
 * off keeps a periodic line out of the dev terminal while it still reaches the file.
 */
import { appendMainLog, appendMainLogSync } from '../../lib/main-log-file';
import type { MainLogLevel } from '../../lib/main-log-file';

type NoteOptions = { sync?: boolean; terminal?: boolean };

const TAG = '[forensics]';

const writeTerminal = (level: MainLogLevel, line: string): void => {
  const stream = level === 'error' || level === 'warn' ? process.stderr : process.stdout;
  try {
    if (stream.writable) stream.write(`${line}\n`);
  } catch {
    // A GUI launch may have no terminal at all; the disk line is the one that matters.
  }
};

const note = (level: MainLogLevel, message: string, options: NoteOptions = {}): void => {
  const { sync = false, terminal = true } = options;
  const line = `${TAG} ${message}`;
  if (terminal) writeTerminal(level, line);
  if (sync) appendMainLogSync(level, line);
  else appendMainLog(level, line);
};

/** For handlers with no guaranteed next tick: the line is on disk before they return. */
const noteSync = (level: MainLogLevel, message: string): void => note(level, message, { sync: true });

const stackOf = (value: unknown): string => {
  if (value instanceof Error) return value.stack ?? `${value.name}: ${value.message}`;
  return String(value);
};

export { note, noteSync, stackOf };
