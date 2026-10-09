/* @layer renderer-components @kind types */
import type { FlakyByte } from '../flaky-byte-detect';

interface FlakyByteWarningDialogProps {
  open: boolean;
  flakyBytes: FlakyByte[];
  liveRanges: Record<number, number>;
  onExcludeAndContinue: (indices: number[]) => void;
  onContinueAnyway: () => void;
  onCancel: () => void;
}

export type { FlakyByteWarningDialogProps };
