/* @layer renderer-lib @kind logic */
import { publishImportProgress } from '../import-progress-bus';
import type { RomImportPhase } from './roms-store.type';

const emitRomProgress = (phase: RomImportPhase, loaded?: number, total?: number, message?: string): void =>
  publishImportProgress({ kind: 'rom', id: 'rom', phase, loaded, total, message });

export { emitRomProgress };
