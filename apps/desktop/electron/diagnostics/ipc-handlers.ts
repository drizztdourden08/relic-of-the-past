/* @layer electron-main @kind logic */
/**
 * Diagnostics IPC: one read-only channel returning the host hardware/OS readout
 * that backs the About page's debug-info block.
 */
import type { SystemDiagnostics } from '@shared/types/diagnostics';
import { handle } from '../lib/ipc/handle';
import { collectCpu, collectMemory, collectOs, collectVersions } from './collect-host';
import { collectDisplays } from './collect-displays';
import { collectGpu } from './collect-gpu';

const collectSystemDiagnostics = async (): Promise<SystemDiagnostics> => ({
  os: collectOs(),
  cpu: collectCpu(),
  memory: collectMemory(),
  gpu: await collectGpu(),
  displays: collectDisplays(),
  versions: collectVersions(),
});

const registerDiagnosticsHandlers = (): void => {
  handle('diagnostics:getSystem', () => collectSystemDiagnostics());
};

export { registerDiagnosticsHandlers };
