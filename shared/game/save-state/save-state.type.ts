/* @layer shared-game @kind types */
interface KnownFormat {
  id: string;
  since: string;
  note: string;
}

interface StateStamp {
  v: 1;
  app: string;
  formatId: string;
  at: number;
  dialog?: string;
}

type TargetCompat =
  | { kind: 'compatible' }
  | { kind: 'incompatible'; targetId: string }
  | { kind: 'unverifiable'; why: 'not-published' | 'unreachable' };

type Loadability =
  | { ok: true; stamp: StateStamp }
  | { ok: false; stamp: StateStamp | null; reason: 'format-mismatch' | 'not-a-state'; message: string };

export type { KnownFormat, Loadability, StateStamp, TargetCompat };
