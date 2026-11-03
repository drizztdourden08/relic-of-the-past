/* @layer shared-types @kind types */
type EventLogEntry =
  | { t: 'location-checked'; id: number; name: string; frame: number }
  | { t: 'item-received'; id: number; name: string; from: string; self: boolean; frame: number }
  | { t: 'connected'; slot: string; server: string }
  | { t: 'disconnected'; reason: string }
  | { t: 'lobby-join-refused'; reason: string; code?: string };

export type { EventLogEntry };
