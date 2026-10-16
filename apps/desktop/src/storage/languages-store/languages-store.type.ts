/* @layer renderer-lib @kind types */
type LanguageResult = { success: true; code: string } | { success: false; error: string };

type LanguageImportPhase = 'download' | 'decode' | 'extract' | 'done' | 'error';

export type { LanguageResult, LanguageImportPhase };
