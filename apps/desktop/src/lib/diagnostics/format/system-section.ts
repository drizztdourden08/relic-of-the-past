/* @layer renderer-lib @kind logic */
import type { SystemDiagnostics } from '@shared/types/diagnostics';
import type { DebugSection } from './section.type';
import { section } from './section';
import { duration, orDash, yesNo } from './units';

const systemSection = ({ os, versions }: SystemDiagnostics): DebugSection => section('System', [
  `OS: ${orDash(os.version)} (${orDash(os.release)}) ${os.arch}`,
  `Uptime: ${duration(os.uptimeSeconds)} · On battery: ${yesNo(os.onBattery)}`,
  `Locale: ${orDash(os.locale)} (system ${orDash(os.systemLocale)}) · Time zone: ${orDash(os.timeZone)}`,
  os.preferredLanguages.length > 0 && `Preferred languages: ${os.preferredLanguages.join(', ')}`,
  `Versions: node ${versions.node} · v8 ${versions.v8} · chromium ${versions.chrome} · electron ${versions.electron}`,
]);

export { systemSection };
