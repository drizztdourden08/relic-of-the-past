/* @layer renderer-other @kind types */
type AnyFn = (...args: unknown[]) => unknown;

type EditRefusal = { success: false; error: string };

export type { AnyFn, EditRefusal };
