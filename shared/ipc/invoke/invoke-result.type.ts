/* @layer shared-types @kind types */
type InvokeResult = { success: boolean; error?: string };

type TriggerCal = { base: number; max: number; deadzone: number };

type ReviewMap = Record<string, { status: string; comment?: string }>;

export type { InvokeResult, ReviewMap, TriggerCal };
