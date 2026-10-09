/* @layer shared-game @kind types */
type EntryIssue =
  | { kind: 'char-not-in-alphabet'; ch: string }
  | { kind: 'ref-unresolved'; key: string };

export type { EntryIssue };
