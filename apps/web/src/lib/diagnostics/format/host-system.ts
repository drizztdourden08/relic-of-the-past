/* @layer renderer-lib @kind logic */
/** OS, CPU and memory sections of the host readout. */
import type { SystemDiagnostics } from '@shared/types/diagnostics';
import type { DebugSection } from './section';
import { section } from './section';
import { duration, ghz, gib, orDash, yesNo } from './units';

const systemSection = ({ os, versions }: SystemDiagnostics): DebugSection => section('System', [
  `OS: ${orDash(os.version)} (${orDash(os.release)}) ${os.arch}`,
  `Uptime: ${duration(os.uptimeSeconds)} · On battery: ${yesNo(os.onBattery)}`,
  `Locale: ${orDash(os.locale)} (system ${orDash(os.systemLocale)}) · Time zone: ${orDash(os.timeZone)}`,
  os.preferredLanguages.length > 0 && `Preferred languages: ${os.preferredLanguages.join(', ')}`,
  `Versions: node ${versions.node} · v8 ${versions.v8} · chromium ${versions.chrome} · electron ${versions.electron}`,
]);

const hardwareSection = ({ cpu, memory }: SystemDiagnostics): DebugSection => section('CPU & memory', [
  `CPU: ${cpu.model} — ${cpu.logicalCores} logical cores @ ${ghz(cpu.speedMhz)} (${cpu.arch})`,
  `RAM: ${gib(memory.totalBytes)} total, ${gib(memory.freeBytes)} free`,
  memory.swapTotalBytes !== null
    && `Swap: ${gib(memory.swapTotalBytes)} total, ${gib(memory.swapFreeBytes ?? 0)} free`,
]);

export { systemSection, hardwareSection };
