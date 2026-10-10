/* @layer shared-storage @kind types */
type AutoTrigger = 'timer' | 'quit';

type NormalEntry = { id: string; name: string; timestamp: number };

type AutoEntry = { id: string; timestamp: number; trigger: AutoTrigger };

type SavePayload = { data: Uint8Array; screenshot?: Uint8Array | undefined };

export type { AutoEntry, AutoTrigger, NormalEntry, SavePayload };
