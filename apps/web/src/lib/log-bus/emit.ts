/* @layer renderer-lib @kind logic */
import type { LogChannel, LogEntry, LogLevel } from './log-bus.type';
import { MAX_ENTRIES } from './log-bus.constants';
import { logRing } from './log-ring';

const notifyListeners = (entry: LogEntry): void => {
  for (const listener of logRing.listeners) {
    try {
      listener(entry);
    } catch {
      continue;
    }
  }
};

const mirrorToConsole = (channel: LogChannel, level: LogLevel, message: string): void => {
  const line = `[${channel}] ${message}`;
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);
};

const emit = (channel: LogChannel, level: LogLevel, message: string): void => {
  const entry: LogEntry = {
    id: logRing.nextId++,
    timestamp: Date.now(),
    channel,
    level,
    message,
  };

  logRing.entries.push(entry);
  if (logRing.entries.length > MAX_ENTRIES) {
    logRing.entries.shift();
  }

  notifyListeners(entry);
  mirrorToConsole(channel, level, message);
};

export { emit };
