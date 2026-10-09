/* @layer electron-main @kind logic */
import { app, powerMonitor } from 'electron';
import { arch, platform, release, uptime, version } from 'os';
import type { OsDiagnostics } from '@shared/types/diagnostics';

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

export { collectOs };
