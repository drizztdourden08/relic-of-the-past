/* @layer renderer-lib @kind types */
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

export type { LogChannel, LogLevel, LogEntry, LogListener };
