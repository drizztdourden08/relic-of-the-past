/* @layer renderer-lib @kind logic */
/**
 * Writes the log buffer to the user's data folder when the core crashes, so a crash
 * report is a file to attach instead of a screenshot of the logs widget.
 */
import { getEntries } from './log-bus';
import { getPlatform } from '@app/platform/get-platform';

const formatEntry = (timestamp: number, channel: string, level: string, message: string): string =>
  `${new Date(timestamp).toISOString()} [${channel}] ${level.toUpperCase().padEnd(5)} ${message}`;

/** Fire-and-forget: a failed dump must never make a crash worse. */
const writeCrashDump = async (reason: string, stack?: string): Promise<void> => {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const lines = getEntries().map((entry) => formatEntry(entry.timestamp, entry.channel, entry.level, entry.message));
  const body = [
    `Crash: ${reason}`,
    ...(stack ? ['', stack] : []),
    '',
    '--- log buffer at crash ---',
    ...lines,
    '',
  ].join('\n');
  try {
    await getPlatform().files.writeText(`debug/crash-${stamp}.log`, body);
  } catch {
    // The dump is best-effort; the in-app log still has everything.
  }
};

export { writeCrashDump };
