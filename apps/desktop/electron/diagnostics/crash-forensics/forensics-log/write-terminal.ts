/* @layer electron-main @kind logic */
import type { MainLogLevel } from '../../../lib/main-log-file';

const writeTerminal = (level: MainLogLevel, line: string): void => {
  const stream = level === 'error' || level === 'warn' ? process.stderr : process.stdout;
  try {
    if (stream.writable) stream.write(`${line}\n`);
  } catch {
    return;
  }
};

export { writeTerminal };
