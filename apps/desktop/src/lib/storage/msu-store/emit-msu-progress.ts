/* @layer renderer-lib @kind logic */
import { publishImportProgress } from '../import-progress-bus';
import type { MsuImportPhase } from './msu-store.type';

const emitMsuProgress = (phase: MsuImportPhase, loaded?: number, total?: number, message?: string): void =>
  publishImportProgress({ kind: 'msu', id: 'msu', phase, loaded, total, message });

export { emitMsuProgress };
