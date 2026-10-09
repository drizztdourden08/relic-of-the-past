/* @layer shared-types @kind types */
type InvokeResult = { success: boolean; error?: string };

type ReviewMap = Record<string, { status: string; comment?: string }>;

export type { InvokeResult, ReviewMap };
