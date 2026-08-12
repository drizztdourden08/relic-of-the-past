/* @layer renderer-lib @kind logic */
type LogChannel = 'core' | 'app' | 'randomizer' | 'wasm' | 'ipc' | 'sim' | 'error';
type LogLevel = 'info' | 'warn' | 'error';

interface LogEntry {
  id: number;
  timestamp: number;
  channel: LogChannel;
  level: LogLevel;
  message: string;
}

type LogListener = (entry: LogEntry) => void;

const MAX_ENTRIES = 200;

let nextId = 0;
const entries: LogEntry[] = [];
const listeners = new Set<LogListener>();

const emit = (channel: LogChannel, level: LogLevel, message: string): void => {
  const entry: LogEntry = {
    id: nextId++,
    timestamp: Date.now(),
    channel,
    level,
    message,
  };

  entries.push(entry);
  if (entries.length > MAX_ENTRIES) {
    entries.shift();
  }

  for (const listener of listeners) {
    try {
      listener(entry);
    } catch {
      // Don't let a bad listener break the bus
    }
  }

  // Dev-only: mirror into the native console so main-process file logging
  // (apps/desktop/electron/lib/dev-file-logger.ts) captures this app's own
  // structured log channels too, not just ad-hoc console.* calls.
  if (import.meta.env.DEV) {
    const line = `[${channel}] ${message}`;
    if (level === 'error') console.error(line);
    else if (level === 'warn') console.warn(line);
    else console.log(line);
  }
};

const log = {
  core(msg: string, level: LogLevel = 'info'): void { emit('core', level, msg); },
  app(msg: string, level: LogLevel = 'info'): void { emit('app', level, msg); },
  randomizer(msg: string, level: LogLevel = 'info'): void { emit('randomizer', level, msg); },
  wasm(msg: string, level: LogLevel = 'info'): void { emit('wasm', level, msg); },
  ipc(msg: string, level: LogLevel = 'info'): void { emit('ipc', level, msg); },
  sim(msg: string, level: LogLevel = 'info'): void { emit('sim', level, msg); },
  error(msg: string): void { emit('error', 'error', msg); },
};

const subscribe = (listener: LogListener): () => void => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const getEntries = (): LogEntry[] => {
  return [...entries];
};

const CHANNEL_COLORS: Record<LogChannel, string> = {
  core: '#4a9',
  app: '#5b9bd5',
  randomizer: '#b388ff',
  wasm: '#4dd0e1',
  ipc: '#ffd54f',
  sim: '#ff9e64',
  error: '#e94560',
};

// Intercept global errors and unhandled rejections
const installGlobalHandlers = (): void => {
  window.addEventListener('error', (e) => {
    // WASM RuntimeErrors are handled exclusively by the lifecycle crash handler.
    // Never log them here — they would flood during the game loop.
    if (e.error instanceof WebAssembly.RuntimeError) {
      e.preventDefault();
      return;
    }
    log.error(`${e.message} (${e.filename}:${e.lineno})`);
  });
  window.addEventListener('unhandledrejection', (e) => {
    log.error(`Unhandled rejection: ${e.reason}`);
  });
};

installGlobalHandlers();

// Expose getEntries for Playwright / devtools access
(window as any).__logEntries = getEntries;

export { log, subscribe, getEntries, CHANNEL_COLORS };
export type { LogChannel, LogLevel, LogEntry, LogListener };
