/* @layer renderer-app @kind types */
type RecordKind = 'check' | 'screen' | 'item' | 'place';

type NamedRecord = { readonly id: string; readonly name: string };

export type { NamedRecord, RecordKind };
