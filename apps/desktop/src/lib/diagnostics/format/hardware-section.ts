/* @layer renderer-lib @kind logic */
import type { SystemDiagnostics } from '@shared/types/diagnostics';
import type { DebugSection } from './section.type';
import { section } from './section';
import { ghz, gib } from './units';

const hardwareSection = ({ cpu, memory }: SystemDiagnostics): DebugSection => section('CPU & memory', [
  `CPU: ${cpu.model}, ${cpu.logicalCores} logical cores @ ${ghz(cpu.speedMhz)} (${cpu.arch})`,
  `RAM: ${gib(memory.totalBytes)} total, ${gib(memory.freeBytes)} free`,
  memory.swapTotalBytes !== null
    && `Swap: ${gib(memory.swapTotalBytes)} total, ${gib(memory.swapFreeBytes ?? 0)} free`,
]);

export { hardwareSection };
