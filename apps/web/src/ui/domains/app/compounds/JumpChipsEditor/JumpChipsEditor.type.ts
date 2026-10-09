/* @layer renderer-components @kind types */
interface JumpChipsEditorProps {
  jumps: readonly number[];
  span: number;
  maxJump?: number;
  problem?: string;
  disabled?: boolean;
  onChange: (next: readonly number[]) => void;
  className?: string;
}

export type { JumpChipsEditorProps };
