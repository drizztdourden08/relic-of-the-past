/* @layer renderer-lib @kind types */
type LanguageResult = { success: boolean; error?: string };

type LanguageImportPhase = 'download' | 'decode' | 'extract' | 'done' | 'error';

export type { LanguageResult, LanguageImportPhase };
