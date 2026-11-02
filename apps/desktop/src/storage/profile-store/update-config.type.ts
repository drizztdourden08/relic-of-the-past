/* @layer renderer-lib @kind types */
type ConfigChange = (current: Record<string, unknown>) => Record<string, unknown>;

export type { ConfigChange };
