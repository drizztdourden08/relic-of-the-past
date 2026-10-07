/* @layer electron-main @kind logic */
/**
 * OS / CPU / memory side of the host readout. Everything here comes from the
 * `os` module or the app itself, so it is cheap and synchronous.
 */
import { app, powerMonitor } from 'electron';
import { arch, cpus, freemem, platform, release, totalmem, uptime, version } from 'os';
import type { CpuDiagnostics, MemoryDiagnostics, OsDiagnostics, RuntimeVersions } from '@shared/types/diagnostics';

const collectCpu = (): CpuDiagnostics => {
  const cores = cpus();
  return {
    model: cores[0]?.model?.trim() || 'unknown',
    logicalCores: cores.length,
    speedMhz: cores[0]?.speed ?? 0,
    arch: arch(),
  };
};

const collectMemory = (): MemoryDiagnostics => {
  // getSystemMemoryInfo is the only source of swap figures and reports kilobytes.
  // It is unavailable on some sandboxes, so swap degrades to null while total/free
  // always come from the os module.
  let swapTotalBytes: number | null = null;
  let swapFreeBytes: number | null = null;
  try {
    const info = process.getSystemMemoryInfo();
    swapTotalBytes = info.swapTotal * 1024;
    swapFreeBytes = info.swapFree * 1024;
  } catch {
    // no swap reporting on this platform
  }
  return { totalBytes: totalmem(), freeBytes: freemem(), swapTotalBytes, swapFreeBytes };
};

const collectOs = (): OsDiagnostics => ({
  platform: platform(),
  version: version(),
  release: release(),
  arch: arch(),
  uptimeSeconds: Math.round(uptime()),
  locale: app.getLocale(),
  systemLocale: app.getSystemLocale(),
  preferredLanguages: app.getPreferredSystemLanguages(),
  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  onBattery: powerMonitor.onBatteryPower,
});

const collectVersions = (): RuntimeVersions => ({
  node: process.versions.node ?? 'unknown',
  v8: process.versions.v8 ?? 'unknown',
  chrome: process.versions.chrome ?? 'unknown',
  electron: process.versions.electron ?? 'unknown',
});

export { collectCpu, collectMemory, collectOs, collectVersions };
