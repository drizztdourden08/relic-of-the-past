/* @layer renderer-components @kind types */
type LineAdvanceKind = 'row' | 'scroll' | null;

type DialogueLineAttrs = {
  advanceKind: LineAdvanceKind;
  advanceRow: 1 | 2 | 3 | null;
  endsBox: boolean;
};

export type { DialogueLineAttrs, LineAdvanceKind };
