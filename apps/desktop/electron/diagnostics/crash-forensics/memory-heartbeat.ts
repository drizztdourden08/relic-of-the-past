/* @layer electron-main @kind logic */
import { app } from 'electron';
import type { ProcessMetric } from 'electron';
import { note } from './forensics-log';
import { HEARTBEAT_MS } from './memory-heartbeat.constants';

const kb = (bytes: number): string => `${Math.round(bytes / 1024)}K`;

const mainUsage = (): string => {
  const { rss, heapUsed, heapTotal, external, arrayBuffers } = process.memoryUsage();
  return `main rss=${kb(rss)} heap=${kb(heapUsed)}/${kb(heapTotal)} ext=${kb(external)} ab=${kb(arrayBuffers)}`;
};

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
    return;
  }
};

let timer: NodeJS.Timeout | null = null;

const startMemoryHeartbeat = (): void => {
  if (timer) return;
  timer = setInterval(heartbeat, HEARTBEAT_MS);
  timer.unref();
};

export { startMemoryHeartbeat };
