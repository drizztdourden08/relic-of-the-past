/* @layer renderer-lib @kind logic */
import { getEntries } from './log-bus';
import { getPlatform } from '@drizztdourden08/brock-react';

const formatEntry = (timestamp: number, channel: string, level: string, message: string): string =>
  `${new Date(timestamp).toISOString()} [${channel}] ${level.toUpperCase().padEnd(5)} ${message}`;

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
    return;
  }
};

export { writeCrashDump };
