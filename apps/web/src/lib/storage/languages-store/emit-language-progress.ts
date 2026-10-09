/* @layer renderer-lib @kind logic */
import { publishImportProgress } from '../import-progress-bus';
import type { LanguageImportPhase } from './languages-store.type';

const emitLanguageProgress = (phase: LanguageImportPhase, loaded?: number, total?: number, message?: string): void =>
  publishImportProgress({ kind: 'language', id: 'language', phase, loaded, total, message });

export { emitLanguageProgress };
