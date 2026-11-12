/* @layer shared-types @kind types */
type TouchBindTarget =
  | { kind: 'classic'; id: string }
  | { kind: 'verb'; id: string }
  | { kind: 'slot'; index: number };

export type { TouchBindTarget };
