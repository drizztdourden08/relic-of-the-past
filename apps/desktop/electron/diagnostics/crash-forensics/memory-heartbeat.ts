/* @layer electron-main @kind logic */
/**
 * One compact line every 30 s: the main process's own memory, then every process
 * Electron knows about (browser, GPU, renderer, utilities), so the log leading up to
 * a death shows whether something was growing. File only, not the terminal. The
 * timer is unref'd, so it never keeps the process alive.
 */
import { app } from 'electron';
import type { ProcessMetric } from 'electron';
import { note } from './forensics-log';

const HEARTBEAT_MS = 30_000;

const kb = (bytes: number): string => `${Math.round(bytes / 1024)}K`;

const mainUsage = (): string => {
  const { rss, heapUsed, heapTotal, external, arrayBuffers } = process.memoryUsage();
  return `main rss=${kb(rss)} heap=${kb(heapUsed)}/${kb(heapTotal)} ext=${kb(external)} ab=${kb(arrayBuffers)}`;
};

// workingSetSize / peakWorkingSetSize are already in kilobytes.
const metricLine = ({ type, pid, name, serviceName, memory, cpu }: ProcessMetric): string => {
  const label = name ?? serviceName;
  const head = label ? `${type}(${label})` : type;
  return `${head}#${pid} ws=${memory.workingSetSize}K peak=${memory.peakWorkingSetSize}K cpu=${cpu.percentCPUUsage.toFixed(1)}%`;
};

const heartbeat = (): void => {
  try {
    const metrics = app.getAppMetrics().map(metricLine).join(' ; ');
    note('info', `heartbeat ${mainUsage()} | ${metrics}`, { terminal: false });
  } catch {
    // A metrics read must never be the thing that fails.
  }
};

let timer: NodeJS.Timeout | null = null;

const startMemoryHeartbeat = (): void => {
  if (timer) return;
  timer = setInterval(heartbeat, HEARTBEAT_MS);
  timer.unref();
};

export { startMemoryHeartbeat, HEARTBEAT_MS };
