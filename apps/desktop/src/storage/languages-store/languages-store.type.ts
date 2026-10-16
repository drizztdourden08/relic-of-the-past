/* @layer renderer-lib @kind types */
type LanguageResult = { success: true; code: string } | { success: false; error: string };

export type { LanguageResult };
