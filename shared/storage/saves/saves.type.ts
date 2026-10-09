/* @layer shared-storage @kind types */
type AutoTrigger = 'timer' | 'quit';

type NormalEntry = { id: string; name: string; timestamp: number };

type AutoEntry = { id: string; timestamp: number; trigger: AutoTrigger };

export type { AutoEntry, AutoTrigger, NormalEntry };
