/* @layer renderer-components @kind types */
interface JumpChipsEditorProps {
  /** The user's own jumps, one editable chip each. */
  jumps: readonly number[];
  /** The span the jumps must sum to. */
  span: number;
  /** The most one jump may carry (the family's largest item); the span when absent. */
  maxJump?: number;
  /** Why the sequence is rejected; undefined while it is exact. */
  problem?: string;
  disabled?: boolean;
  onChange: (next: readonly number[]) => void;
  className?: string;
}

export type { JumpChipsEditorProps };
