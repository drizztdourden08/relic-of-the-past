/* @layer electron-main @kind logic */
import { arch, cpus } from 'os';
import type { CpuDiagnostics } from '@shared/types/diagnostics';

const collectCpu = (): CpuDiagnostics => {
  const cores = cpus();
  return {
    model: cores[0]?.model?.trim() || 'unknown',
    logicalCores: cores.length,
    speedMhz: cores[0]?.speed ?? 0,
    arch: arch(),
  };
};

export { collectCpu };
