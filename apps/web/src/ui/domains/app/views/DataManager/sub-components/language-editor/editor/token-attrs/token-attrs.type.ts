/* @layer renderer-components @kind types */
type DialogueTokenKind = 'cmd' | 'break' | 'var' | 'ref';

type DialogueTokenAttrs = {
  kind: DialogueTokenKind;
  name: string | null;
  param: number | null;
  row: 1 | 2 | 3 | null;
  slot: number | null;
  key: string | null;
};

export type { DialogueTokenAttrs, DialogueTokenKind };
